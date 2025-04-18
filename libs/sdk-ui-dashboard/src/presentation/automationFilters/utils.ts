// (C) 2025 GoodData Corporation

import {
    absoluteDateFilterValues,
    areObjRefsEqual,
    DateFilterType,
    filterAttributeElements,
    FilterContextItem,
    filterLocalIdentifier,
    IAutomationVisibleFilter,
    ICatalogAttribute,
    ICatalogDateDataset,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfigItem,
    IFilter,
    isAbsoluteDateFilter,
    isAllTimeDashboardDateFilter,
    isAllTimeDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    isNegativeAttributeFilter,
    isRelativeDateFilter,
    ObjRef,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import compact from "lodash/compact.js";

export const getFilterLocalIdentifier = (filter: FilterContextItem): string | undefined => {
    if (isDashboardAttributeFilter(filter)) {
        return filter.attributeFilter.localIdentifier;
    } else if (isDashboardDateFilter(filter)) {
        return filter.dateFilter.localIdentifier;
    }
    return undefined;
};

export const validateAllFilterLocalIdentifiers = (filters: FilterContextItem[]): boolean => {
    return filters.every((filter) => getFilterLocalIdentifier(filter) !== undefined);
};

export const areFiltersMatchedByIdentifier = (
    filter1: FilterContextItem,
    filter2: FilterContextItem,
): boolean => {
    return getFilterLocalIdentifier(filter1) === getFilterLocalIdentifier(filter2);
};

export const getNonSelectedFilters = (
    allFilters: FilterContextItem[],
    selectedFilters: FilterContextItem[],
) => {
    return allFilters.filter((allFilter) => {
        return !selectedFilters.some((selectedFilter) => {
            return areFiltersMatchedByIdentifier(allFilter, selectedFilter);
        });
    });
};

export const getCatalogAttributesByFilters = (
    filters: FilterContextItem[],
    attributes: ICatalogAttribute[],
): ICatalogAttribute[] => {
    return attributes.filter((attribute) => {
        return filters.some((filter) => {
            if (isDashboardAttributeFilter(filter)) {
                return attribute.displayForms.some((displayForm) => {
                    return areObjRefsEqual(displayForm.ref, filter.attributeFilter.displayForm);
                });
            }

            return false;
        });
    });
};

export const getCatalogDateDatasetsByFilters = (
    filters: FilterContextItem[],
    dateDataset: ICatalogDateDataset[],
): ICatalogDateDataset[] => {
    return dateDataset.filter((dateDataset) => {
        return filters.some((filter) => {
            if (isDashboardDateFilter(filter)) {
                return areObjRefsEqual(dateDataset.dataSet.ref, filter.dateFilter.dataSet);
            }

            return false;
        });
    });
};

export const getFilterByCatalogItemRef = (
    ref: ObjRef,
    filters: FilterContextItem[],
): FilterContextItem | undefined => {
    return filters.find((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            return areObjRefsEqual(filter.attributeFilter.displayForm, ref);
        } else if (isDashboardDateFilter(filter)) {
            return areObjRefsEqual(filter.dateFilter.dataSet, ref);
        }
        return false;
    });
};

export const getVisibleFiltersByFilters = (
    selectedFilters: FilterContextItem[] | undefined,
    visibleFiltersMetadata: IAutomationVisibleFilter[] | undefined,
): IAutomationVisibleFilter[] => {
    const filters = (selectedFilters ?? []).map((selectedFilter) => {
        return (visibleFiltersMetadata ?? []).find((visibleFilter) => {
            if (isDashboardAttributeFilter(selectedFilter)) {
                return selectedFilter.attributeFilter.localIdentifier === visibleFilter.localIdentifier;
            } else {
                return selectedFilter.dateFilter.localIdentifier === visibleFilter.localIdentifier;
            }
        });
    });

    return compact(filters);
};

export const getNonHiddenFilters = (
    filters: FilterContextItem[] | undefined,
    attributeConfigs: IDashboardAttributeFilterConfig[],
    dateConfigs: IDashboardDateFilterConfigItem[],
): FilterContextItem[] => {
    return (filters ?? []).filter((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const config = attributeConfigs.find(
                (attribute) => attribute.localIdentifier === filter.attributeFilter.localIdentifier,
            );
            return config?.mode !== "hidden";
        } else {
            const config = dateConfigs.find((date) =>
                areObjRefsEqual(date.dateDataSet, filter.dateFilter.dataSet),
            );
            return config?.config.mode !== "hidden";
        }
    });
};

export const getFilterByLocalIdentifier = (
    localIdentifier: string | undefined,
    filters: FilterContextItem[],
): FilterContextItem | undefined => {
    if (!localIdentifier) {
        return undefined;
    }

    return filters.find((filter) => {
        const filterLocalIdentifier = getFilterLocalIdentifier(filter);
        return filterLocalIdentifier === localIdentifier;
    });
};

/**
 * When working with widget execution filters, we find the filters in dashboard filters
 * and update their values to match the execution filter values.
 */
export const updateFiltersByExecutionFilterValues = (
    executionFilters: IFilter[] | undefined,
    allFilters: FilterContextItem[],
): FilterContextItem[] | undefined => {
    if (!executionFilters) {
        return undefined;
    }

    const updatedFilters = executionFilters.map((executionFilter) => {
        const executionFilterLocalIdentifier = filterLocalIdentifier(executionFilter);
        const dashboardFilter = getFilterByLocalIdentifier(executionFilterLocalIdentifier, allFilters);

        if (!dashboardFilter) {
            return undefined;
        }

        if (isDashboardAttributeFilter(dashboardFilter)) {
            const elements = filterAttributeElements(executionFilter);
            const elementsObj = elements
                ? {
                      attributeElements: elements,
                      negativeSelection: isNegativeAttributeFilter(executionFilter),
                  }
                : {};

            return {
                ...dashboardFilter,
                attributeFilter: {
                    ...dashboardFilter.attributeFilter,
                    ...elementsObj,
                },
            };
        } else if (isAllTimeDateFilter(executionFilter) && isAllTimeDashboardDateFilter(dashboardFilter)) {
            // All time date filter needs to be fully copied due to different granularity and values
            return {
                ...dashboardFilter,
            };
        } else {
            const type: DateFilterType = isAbsoluteDateFilter(executionFilter) ? "absolute" : "relative";
            const dateFilterValues = isAbsoluteDateFilter(executionFilter)
                ? absoluteDateFilterValues(executionFilter)
                : isRelativeDateFilter(executionFilter)
                ? relativeDateFilterValues(executionFilter)
                : {};

            return {
                ...dashboardFilter,
                dateFilter: {
                    ...dashboardFilter.dateFilter,
                    ...dateFilterValues,
                    type,
                },
            };
        }
    });

    return compact(updatedFilters);
};
