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
} from "@gooddata/sdk-model";
import { AfmValidObjectsQueryTypesEnum } from "@gooddata/gd-tiger-client";
import compact = require("lodash/compact");

import { TigerWorkspaceCatalogWithAvailableItems } from "./catalogWithAvailableItems";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { convertMeasure } from "../../../toAfm/MeasureConverter";
import { convertVisualizationObjectFilter } from "../../../toAfm/FilterConverter";
import { convertAttribute } from "../../../toAfm/AttributeConverter";

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

const catalogItemId = (item: CatalogItem): string => {
    return isCatalogAttribute(item)
        ? item.attribute.id
        : isCatalogFact(item)
        ? item.fact.id
        : isCatalogMeasure(item)
        ? item.measure.id
        : "";
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
            production: true,
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
        const availableItemsResponse = await this.authCall(sdk =>
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

        const availableIds = availableItemsResponse.data.items;
        const availableItems = this.items.filter(item => availableIds.includes(catalogItemId(item)));

        return new TigerWorkspaceCatalogWithAvailableItems(this.groups, this.items, availableItems);
    }
}
