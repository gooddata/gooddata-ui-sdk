// (C) 2019-2026 GoodData Corporation

import { compact, intersectionWith, uniq } from "lodash-es";
import { InvariantError } from "ts-invariant";

import { type AfmValidObjectsQuery, type AfmValidObjectsQueryTypesEnum } from "@gooddata/api-client-tiger";
import { ActionsApi_ComputeValidObjects } from "@gooddata/api-client-tiger/endpoints/validObjects";
import {
    type IWorkspaceCatalogAvailableItemsFactory,
    type IWorkspaceCatalogWithAvailableItemsFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type CatalogItemType,
    type IAttribute,
    type IAttributeOrMeasure,
    type ICatalogGroup,
    type IFilter,
    type IInsightDefinition,
    type ObjRef,
    type ObjRefInScope,
    areObjRefsEqual,
    attributeLocalId,
    insightAttributes,
    insightFilters,
    insightMeasures,
    isAttribute,
    isCatalogAttribute,
    isCatalogAttributeHierarchy,
    isCatalogComputedAttribute,
    isCatalogFact,
    isCatalogMeasure,
    isFilter,
    isIdentifierRef,
    isLocalIdRef,
    isMeasure,
    isMeasureValueFilter,
    isRankingFilter,
    measureLocalId,
} from "@gooddata/sdk-model";

import { jsonApiIdToObjRef } from "../../../convertors/fromBackend/ObjRefConverter.js";
import { convertAfmFilters } from "../../../convertors/toBackend/afm/AfmFiltersConverter.js";
import { convertAttribute } from "../../../convertors/toBackend/afm/AttributeConverter.js";
import { convertMeasure } from "../../../convertors/toBackend/afm/MeasureConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { TigerWorkspaceCatalogWithAvailableItems } from "./catalogWithAvailableItems.js";

//ivec investigate
const typesMatching: Partial<{ [T in CatalogItemType]: AfmValidObjectsQueryTypesEnum }> = {
    attribute: "attributes",
    fact: "facts",
    measure: "measures",
    // dateDatasets are not supported by tiger in this context
};

const mapToTigerType = (type: CatalogItemType): AfmValidObjectsQueryTypesEnum | undefined => {
    return typesMatching[type];
};

/**
 * Converts a type T to type U that affects availability of items of type T in tiger.
 * @param type - type to convert
 */
const mapToTigerRestrictingType = (type: CatalogItemType): CatalogItemType => {
    if (type === "dateDataset") {
        // date datasets' availability is restricted by their attributes' availability in tiger
        return "attribute";
    }
    if (type === "attributeHierarchy") {
        // attribute hierarchy availability is restricted by used attributes' availability in tiger
        return "attribute";
    }
    return type;
};

const getRestrictingTypes = (requested: CatalogItemType[]): CatalogItemType[] => {
    return uniq(requested.map(mapToTigerRestrictingType));
};

const catalogItemRefs = (item: CatalogItem): ObjRef[] => {
    return isCatalogAttribute(item)
        ? [item.attribute.ref]
        : isCatalogFact(item)
          ? [item.fact.ref]
          : isCatalogMeasure(item)
            ? [item.measure.ref]
            : isCatalogAttributeHierarchy(item)
              ? [item.attributeHierarchy.ref]
              : isCatalogComputedAttribute(item)
                ? [item.computedAttribute.ref]
                : item.dateAttributes.map((attr) => attr.attribute.ref);
};

export class TigerWorkspaceCatalogAvailableItemsFactory implements IWorkspaceCatalogAvailableItemsFactory {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly options: IWorkspaceCatalogWithAvailableItemsFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset", "attributeHierarchy"],
            excludeTags: [],
            includeTags: [],
            loadGroups: true,
        },
        private readonly signal?: AbortSignal,
    ) {}

    public withOptions(
        options: Partial<IWorkspaceCatalogWithAvailableItemsFactoryOptions>,
    ): IWorkspaceCatalogAvailableItemsFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new TigerWorkspaceCatalogAvailableItemsFactory(
            this.authCall,
            this.workspace,
            this.groups,
            this.items,
            newOptions,
            this.signal,
        );
    }

    public forDataset(dataset: ObjRef): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ dataset });
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ types });
    }

    public includeTags(tags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ includeTags: tags });
    }

    public excludeTags(tags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ excludeTags: tags });
    }

    public forItems(items: IAttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ items });
    }

    public forInsight(insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({ insight });
    }

    public withGroups(loadGroups: boolean): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            loadGroups,
        });
    }

    public withSignal(signal: AbortSignal): IWorkspaceCatalogAvailableItemsFactory {
        return new TigerWorkspaceCatalogAvailableItemsFactory(
            this.authCall,
            this.workspace,
            this.groups,
            this.items,
            this.options,
            signal,
        );
    }

    public async load(): Promise<TigerWorkspaceCatalogWithAvailableItems> {
        const { items = [], insight, types } = this.options;
        if (items.length === 0 && !insight) {
            throw new InvariantError("No items or insight was specified!");
        }

        const relevantRestrictingTypes = getRestrictingTypes(types);

        const relevantItems = insight
            ? [...insightMeasures(insight), ...insightAttributes(insight), ...insightFilters(insight)]
            : items;
        // The validObjects action does not accept a computed attribute yet, and one in the query
        // makes it fail for the WHOLE insight - which takes the catalog availability and the date
        // datasets down with it. Leaving computed attributes out narrows the answer (their own
        // restrictions are not applied) instead of losing it.
        //
        // Identified against the CATALOG rather than against the reference's own type: an insight
        // built before the reference carried the computed attribute type still points at one with a
        // plain displayForm type, and such a reference must be dropped too or the request 400s.
        // TODO INE (CQ-2796): include them once the action accepts them
        const computedAttributeIds = new Set(
            this.items.filter(isCatalogComputedAttribute).map((item) => item.computedAttribute.id),
        );
        const attributes = relevantItems
            .filter(isAttribute)
            .filter(
                (attribute) => !isComputedAttributeRef(attribute.attribute.displayForm, computedAttributeIds),
            );
        const measures = relevantItems.filter(isMeasure);
        const filters = relevantItems.filter(isFilter);

        const attributeLocalIds = new Set(attributes.map((attribute) => attributeLocalId(attribute)));
        const measureLocalIds = new Set(measures.map((measure) => measureLocalId(measure)));
        const sanitizedFilters = sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds);

        const { filters: afmFilters, auxMeasures } = convertAfmFilters(measures, sanitizedFilters);

        const afmValidObjectsQuery: AfmValidObjectsQuery = {
            types: compact(relevantRestrictingTypes.map(mapToTigerType)),
            afm: {
                attributes: attributes.map(convertAttribute),
                measures: measures.map(convertMeasure),
                filters: afmFilters,
                auxMeasures,
            },
        };
        const afmValidObjectsQueryEmpty = isAfmValidObjectsQueryEmpty(afmValidObjectsQuery);

        const availableItemsResponse = afmValidObjectsQueryEmpty
            ? null
            : await this.authCall((client) =>
                  ActionsApi_ComputeValidObjects(client.axios, client.basePath, {
                      workspaceId: this.workspace,
                      afmValidObjectsQuery,
                  }),
              );

        const availableObjRefs: ObjRef[] = availableItemsResponse?.data.items.map(jsonApiIdToObjRef) ?? [];
        const availableItems = afmValidObjectsQueryEmpty
            ? this.items
            : filterAvailableItems(availableObjRefs, this.items);
        const allAvailableItems = [
            ...availableItems,
            ...(types.includes("attributeHierarchy") ? this.items.filter(isCatalogAttributeHierarchy) : []),
            // The action cannot evaluate a computed attribute yet, so one would never come back in
            // the response and filterAvailableItems would drop it - hence the pass-through. Only
            // when the query was actually sent: an empty query already answers with every item, and
            // appending would list the computed attributes twice.
            // TODO INE (CQ-2796): drop this once the action evaluates them
            ...(types.includes("computedAttribute") && !afmValidObjectsQueryEmpty
                ? this.items.filter(isCatalogComputedAttribute)
                : []),
        ];

        return new TigerWorkspaceCatalogWithAvailableItems(
            this.groups,
            this.items,
            allAvailableItems,
            this.options,
        );
    }
}

/**
 * Whether a reference points at a computed attribute - either because it says so, or because its
 * identifier is one of the workspace's computed attributes. The fabricated display form of a
 * computed attribute shares the computed attribute's id, so the identifier match holds for both the
 * attribute reference and its display form reference.
 */
export const isComputedAttributeRef = (ref: ObjRef, computedAttributeIds: Set<string>) =>
    isIdentifierRef(ref) && (ref.type === "computedAttribute" || computedAttributeIds.has(ref.identifier));

/**
 * @internal
 */
export function filterAvailableItems(refs: ObjRef[], items: CatalogItem[]): CatalogItem[] {
    return items.filter((item) => {
        const itemRefs = catalogItemRefs(item);

        return intersectionWith(refs, itemRefs, areObjRefsEqual).length > 0;
    });
}

/** @internal */
export const sanitizeFiltersForValidObjects = (
    filters: IFilter[],
    attributeLocalIds: Set<string>,
    measureLocalIds: Set<string>,
): IFilter[] => {
    return filters.filter((filter) => {
        if (isMeasureValueFilter(filter)) {
            const { measure, dimensionality } = filter.measureValueFilter;

            if (referencesUnknownLocalId(measure, measureLocalIds)) {
                return false;
            }

            if (dimensionality?.some((item) => referencesUnknownLocalId(item, attributeLocalIds))) {
                return false;
            }
        } else if (isRankingFilter(filter)) {
            const { measure, attributes = [] } = filter.rankingFilter;

            if (referencesUnknownLocalId(measure, measureLocalIds)) {
                return false;
            }

            if (attributes.some((item) => referencesUnknownLocalId(item, attributeLocalIds))) {
                return false;
            }
        }

        return true;
    });
};

const referencesUnknownLocalId = (
    ref: ObjRefInScope | IAttribute | string | undefined,
    knownLocalIds: Set<string>,
): boolean => {
    const localIdentifier = extractLocalIdentifier(ref);
    return Boolean(localIdentifier && !knownLocalIds.has(localIdentifier));
};

const extractLocalIdentifier = (
    value: ObjRefInScope | IAttribute | string | undefined,
): string | undefined => {
    if (!value) {
        return undefined;
    }

    if (typeof value === "string") {
        return value;
    }

    if (isLocalIdRef(value)) {
        return value.localIdentifier;
    }

    if (isAttribute(value)) {
        return attributeLocalId(value);
    }

    return undefined;
};

function isAfmValidObjectsQueryEmpty({ afm }: AfmValidObjectsQuery) {
    const { attributes, measures, filters, auxMeasures } = afm;

    return (
        attributes.length === 0 &&
        measures.length === 0 &&
        filters.length === 0 &&
        (auxMeasures?.length ?? 0) === 0
    );
}
