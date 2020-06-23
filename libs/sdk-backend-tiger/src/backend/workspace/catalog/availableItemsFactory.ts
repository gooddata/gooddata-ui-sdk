// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    IAttributeOrMeasure,
    IInsightDefinition,
    ObjRef,
    insightMeasures,
    insightAttributes,
    isAttribute,
    isMeasure,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
    insightFilters,
    IFilter,
    isDateFilter,
    isAttributeFilter,
    isMeasureValueFilter,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { AfmValidObjectsQueryTypesEnum } from "@gooddata/api-client-tiger";
import compact = require("lodash/compact");
import intersectionWith = require("lodash/intersectionWith");

import { TigerWorkspaceCatalogWithAvailableItems } from "./catalogWithAvailableItems";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { convertMeasure } from "../../../convertors/toBackend/afm/MeasureConverter";
import { convertVisualizationObjectFilter } from "../../../convertors/toBackend/afm/FilterConverter";
import { convertAttribute } from "../../../convertors/toBackend/afm/AttributeConverter";
import { jsonApiIdToObjRef, isJsonApiId } from "../../../convertors/fromBackend/afm/ObjRefConverter";
import { InvariantError } from "ts-invariant";

const typesMatching: Partial<{ [T in CatalogItemType]: AfmValidObjectsQueryTypesEnum }> = {
    attribute: AfmValidObjectsQueryTypesEnum.Attributes,
    fact: AfmValidObjectsQueryTypesEnum.Facts,
    measure: AfmValidObjectsQueryTypesEnum.Measures,
    // dateDatasets are not supported by tiger in this context
};

const mapType = (type: CatalogItemType): AfmValidObjectsQueryTypesEnum => {
    return typesMatching[type] ?? AfmValidObjectsQueryTypesEnum.UNRECOGNIZED;
};

const isSupportedType = (type: CatalogItemType): boolean => Object.keys(typesMatching).includes(type);

const catalogItemRefs = (item: CatalogItem): ObjRef[] => {
    return isCatalogAttribute(item)
        ? [item.attribute.ref]
        : isCatalogFact(item)
        ? [item.fact.ref]
        : isCatalogMeasure(item)
        ? [item.measure.ref]
        : item.dateAttributes.map((attr) => attr.attribute.ref);
};

export class TigerWorkspaceCatalogAvailableItemsFactory implements IWorkspaceCatalogAvailableItemsFactory {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly options: IWorkspaceCatalogWithAvailableItemsFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset"],
            excludeTags: [],
            includeTags: [],
        },
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

    public async load() {
        const { items = [], insight, types } = this.options;
        if (items.length === 0 && !insight) {
            throw new Error("No items or insight was specified!");
        }

        const relevantTypes = types.filter(isSupportedType);
        if (!relevantTypes.length) {
            // if no relevant types are queried, everything is available (because the backend cannot limit the availability anyway)
            return new TigerWorkspaceCatalogWithAvailableItems(this.groups, this.items, this.items);
        }

        const relevantItems = insight
            ? [...insightMeasures(insight), ...insightAttributes(insight), ...insightFilters(insight)]
            : items;
        const availableItemsResponse = await this.authCall((sdk) =>
            sdk.validObjects.processAfmValidObjectsQuery({
                afmValidObjectsQuery: {
                    types: relevantTypes.map(mapType),
                    afm: {
                        // TODO convertAttribute is right, the OpenAPI spec is wrong so the types are not matching for now
                        attributes: relevantItems.filter(isAttribute).map(convertAttribute) as any,
                        measures: relevantItems.filter(isMeasure).map(convertMeasure),
                        filters: compact(
                            relevantItems
                                .filter(
                                    (filter): filter is IFilter =>
                                        isDateFilter(filter) ||
                                        isAttributeFilter(filter) ||
                                        isMeasureValueFilter(filter),
                                )
                                .map(convertVisualizationObjectFilter),
                        ),
                    },
                },
            }),
        );

        const availableObjRefs: ObjRef[] = convertResponseToObjRefs(availableItemsResponse.data.items);
        const availableItems = filterAvailableItems(availableObjRefs, this.items);

        return new TigerWorkspaceCatalogWithAvailableItems(this.groups, this.items, availableItems);
    }
}

export function convertResponseToObjRefs(availableItemIds: any[]): ObjRef[] {
    if (isJsonApiId(availableItemIds[0])) {
        // Forward-compatibility branch. This will be hit once tiger changes land. Tiger sends { id: string, type: string }

        return availableItemIds.map(jsonApiIdToObjRef);
    } else if (typeof availableItemIds[0] === "string") {
        // Old branch; ids come as string `type/id`

        return availableItemIds.map((idString: string) => {
            const [type, id] = idString.split("/");

            return jsonApiIdToObjRef({ id, type });
        });
    }

    throw new InvariantError("tiger sent unexpected type of available item identifier");
}
/**
 * @internal
 */
export function filterAvailableItems(refs: ObjRef[], items: CatalogItem[]): CatalogItem[] {
    return items.filter((item) => {
        const itemRefs = catalogItemRefs(item);

        return intersectionWith(refs, itemRefs, areObjRefsEqual).length > 0;
    });
}
