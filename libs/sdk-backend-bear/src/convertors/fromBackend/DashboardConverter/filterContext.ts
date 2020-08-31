// (C) 2019-2020 GoodData Corporation
import { GdcFilterContext } from "@gooddata/api-model-bear";
import { uriRef } from "@gooddata/sdk-model";
import {
    IFilterContext,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    ITempFilterContext,
    isDashboardDateFilter,
    IFilterContextDefinition,
    IDashboardAttributeFilterParent,
} from "@gooddata/sdk-backend-spi";

function isNotTemporaryAllTimeDateFilter(filter: FilterContextItem): boolean {
    if (isDashboardDateFilter(filter)) {
        const isNotTemporaryAllTimeDateFilter =
            filter.dateFilter.from !== undefined || filter.dateFilter.to !== undefined;
        return isNotTemporaryAllTimeDateFilter;
    }

    return true;
}

// Remove the temporary "All Time" date filter from filter context when exporting the dashboard
export const sanitizeExportFilterContext = (
    exportFilterContext: IFilterContext | ITempFilterContext,
): IFilterContext | ITempFilterContext => {
    return {
        ...exportFilterContext,
        filters: exportFilterContext.filters.filter(isNotTemporaryAllTimeDateFilter),
    };
};

export const convertFilterContextItem = (
    filterContextItem: GdcFilterContext.FilterContextItem,
): FilterContextItem => {
    if (GdcFilterContext.isAttributeFilter(filterContextItem)) {
        const {
            attributeFilter: {
                attributeElements,
                displayForm,
                negativeSelection,
                localIdentifier,
                filterElementsBy = [],
            },
        } = filterContextItem;

        const convertedFilterElementsBy: IDashboardAttributeFilterParent[] = filterElementsBy.map(
            (filterBy) => {
                return {
                    filterLocalIdentifier: filterBy.filterLocalIdentifier,
                    over: {
                        attributes: filterBy.over.attributes.map(uriRef),
                    },
                };
            },
        );

        const convertedFilterContextItem: IDashboardAttributeFilter = {
            attributeFilter: {
                attributeElements: attributeElements.map(uriRef),
                displayForm: uriRef(displayForm),
                negativeSelection,
                localIdentifier,
                filterElementsBy: convertedFilterElementsBy,
            },
        };

        return convertedFilterContextItem;
    }
    const {
        dateFilter: { granularity, type, attribute, dataSet, from, to },
    } = filterContextItem;
    const convertedFilterContextItem: IDashboardDateFilter = {
        dateFilter: {
            granularity,
            type,
            from,
            to,
        },
    };
    if (attribute) {
        convertedFilterContextItem.dateFilter.attribute = uriRef(attribute);
    }
    if (dataSet) {
        convertedFilterContextItem.dateFilter.dataSet = uriRef(dataSet);
    }

    return convertedFilterContextItem;
};

export const convertFilterContext = (
    filterContext: GdcFilterContext.IWrappedFilterContext,
): IFilterContext | IFilterContextDefinition => {
    const {
        filterContext: {
            content: { filters },
            meta: { identifier, uri, summary, title },
        },
    } = filterContext;

    const convertedFilterContext: IFilterContext | IFilterContextDefinition = {
        description: summary,
        ...(uri
            ? {
                  identifier,
                  uri,
                  ref: uriRef(uri),
              }
            : {}),
        title,
        filters: filters.map(convertFilterContextItem),
    };

    return convertedFilterContext;
};

export const convertTempFilterContext = (
    filterContext: GdcFilterContext.IWrappedTempFilterContext,
): ITempFilterContext => {
    const {
        tempFilterContext: { created, filters, uri },
    } = filterContext;

    const convertedTempFilterContext: ITempFilterContext = {
        uri,
        ref: uriRef(uri),
        filters: filters.map(convertFilterContextItem),
        created,
    };

    return convertedTempFilterContext;
};
