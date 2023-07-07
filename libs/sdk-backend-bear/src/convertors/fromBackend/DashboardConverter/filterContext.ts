// (C) 2019-2023 GoodData Corporation
import * as GdcFilterContext from "@gooddata/api-model-bear/GdcFilterContext";

import {
    uriRef,
    FilterContextItem,
    IDashboardAttributeFilterParent,
    IDashboardDateFilter,
    IFilterContext,
    IFilterContextDefinition,
    ITempFilterContext,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";

function isNotTemporaryAllTimeDateFilter(filter: FilterContextItem): boolean {
    if (isDashboardDateFilter(filter)) {
        return filter.dateFilter.from !== undefined || filter.dateFilter.to !== undefined;
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

/**
 * @internal
 */
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
                title,
                filterElementsBy = [],
                selectionMode,
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

        return {
            attributeFilter: {
                attributeElements: { uris: attributeElements },
                displayForm: uriRef(displayForm),
                negativeSelection,
                localIdentifier,
                filterElementsBy: convertedFilterElementsBy,
                title,
                ...(selectionMode !== undefined ? { selectionMode } : {}),
            },
        };
    }
    const {
        dateFilter: { granularity, type, attribute, dataSet, from, to },
    } = filterContextItem;
    const convertedFilterContextItem: IDashboardDateFilter = {
        dateFilter: {
            granularity,
            type,
            from: type === "relative" ? Number(from) : from,
            to: type === "relative" ? Number(to) : to,
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

/**
 * @internal
 */
export const convertFilterContext = (
    filterContext: GdcFilterContext.IWrappedFilterContext,
): IFilterContext | IFilterContextDefinition => {
    const {
        filterContext: {
            content: { filters },
            meta: { identifier, uri, summary, title },
        },
    } = filterContext;

    return {
        description: summary!,
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
};

export const convertTempFilterContext = (
    filterContext: GdcFilterContext.IWrappedTempFilterContext,
): ITempFilterContext => {
    const {
        tempFilterContext: { created, filters, uri },
    } = filterContext;

    return {
        uri,
        ref: uriRef(uri),
        filters: filters.map(convertFilterContextItem),
        created,
    };
};
