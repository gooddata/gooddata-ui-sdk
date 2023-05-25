// (C) 2019-2022 GoodData Corporation
import {
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeOrMeasure,
    IInsightDefinition,
    ObjRef,
    insightMeasures,
    insightAttributes,
    isAttribute,
    isFilter,
    isMeasure,
    insightFilters,
    areObjRefsEqual,
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";
import { AfmValidObjectsQuery, AfmValidObjectsQueryTypesEnum } from "@gooddata/api-client-tiger";
import intersectionWith from "lodash/intersectionWith.js";
import uniq from "lodash/uniq.js";

import { TigerWorkspaceCatalogWithAvailableItems } from "./catalogWithAvailableItems.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { convertMeasure } from "../../../convertors/toBackend/afm/MeasureConverter.js";
import { convertAttribute } from "../../../convertors/toBackend/afm/AttributeConverter.js";
import { jsonApiIdToObjRef } from "../../../convertors/fromBackend/ObjRefConverter.js";
import { InvariantError } from "ts-invariant";
import { convertAfmFilters } from "../../../convertors/toBackend/afm/AfmFiltersConverter.js";

const typesMatching: Partial<{ [T in CatalogItemType]: AfmValidObjectsQueryTypesEnum }> = {
    attribute: AfmValidObjectsQueryTypesEnum.ATTRIBUTES,
    fact: AfmValidObjectsQueryTypesEnum.FACTS,
    measure: AfmValidObjectsQueryTypesEnum.MEASURES,
    // dateDatasets are not supported by tiger in this context
};

const mapToTigerType = (type: CatalogItemType): AfmValidObjectsQueryTypesEnum => {
    return typesMatching[type] ?? AfmValidObjectsQueryTypesEnum.UNRECOGNIZED;
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
            loadGroups: true,
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

    public withGroups(loadGroups: boolean): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            loadGroups,
        });
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
        const attributes = relevantItems.filter(isAttribute);
        const measures = relevantItems.filter(isMeasure);
        const filters = relevantItems.filter(isFilter);

        const { filters: afmFilters, auxMeasures } = convertAfmFilters(measures, filters);

        const afmValidObjectsQuery: AfmValidObjectsQuery = {
            types: relevantRestrictingTypes.map(mapToTigerType),
            afm: {
                attributes: attributes.map(convertAttribute),
                measures: measures.map(convertMeasure),
                filters: afmFilters,
                auxMeasures,
            },
        };

        const availableItemsResponse = await this.authCall((client) =>
            client.validObjects.computeValidObjects({
                workspaceId: this.workspace,
                afmValidObjectsQuery,
            }),
        );

        const availableObjRefs: ObjRef[] = availableItemsResponse.data.items.map(jsonApiIdToObjRef);
        const availableItems = filterAvailableItems(availableObjRefs, this.items);

        return new TigerWorkspaceCatalogWithAvailableItems(
            this.groups,
            this.items,
            availableItems,
            this.options,
        );
    }
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
