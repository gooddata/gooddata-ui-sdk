// (C) 2025 GoodData Corporation

import { compact, isEqual } from "lodash-es";

import {
    FilterContextItem,
    IAutomationVisibleFilter,
    ICatalogAttribute,
    ICatalogDateDataset,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfigItem,
    IDateFilter,
    IFilter,
    IInsight,
    ObjRef,
    absoluteDateFilterValues,
    areObjRefsEqual,
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    getAttributeElementsItems,
    isAbsoluteDateFilter,
    isAllTimeDashboardDateFilter,
    isAllTimeDateFilter,
    isAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDateFilter,
    isInsightWidget,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
    mergeFilters,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";

import { filterContextItemsToDashboardFiltersByWidget } from "../../converters/index.js";
import { ExtendedDashboardWidget } from "../../model/index.js";

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
    attributeConfigs: IDashboardAttributeFilterConfig[],
): ICatalogAttribute[] => {
    const ignoredLocalIdentifiers = attributeConfigs
        .filter((config) => config.mode === "hidden")
        .map((config) => config.localIdentifier);

    return attributes.filter((attribute) => {
        return filters.some((filter) => {
            if (isDashboardAttributeFilter(filter)) {
                const localIdentifier = filter.attributeFilter.localIdentifier;
                return (
                    localIdentifier &&
                    !ignoredLocalIdentifiers.includes(localIdentifier) &&
                    attribute.displayForms.some((displayForm) => {
                        return areObjRefsEqual(displayForm.ref, filter.attributeFilter.displayForm);
                    })
                );
            }

            return false;
        });
    });
};

export const getCatalogDateDatasetsByFilters = (
    filters: FilterContextItem[],
    dateDataset: ICatalogDateDataset[],
    dateConfigs: IDashboardDateFilterConfigItem[],
): ICatalogDateDataset[] => {
    const ignoredDateDatasets = dateConfigs
        .filter((config) => {
            return config.config.mode === "hidden";
        })
        .map((config) => config.dateDataSet);

    return dateDataset.filter((dateDataset) => {
        return filters.some((filter) => {
            if (isDashboardDateFilter(filter)) {
                return (
                    !ignoredDateDatasets.some((ignoredDataset) =>
                        areObjRefsEqual(dateDataset.dataSet.ref, ignoredDataset),
                    ) && areObjRefsEqual(dateDataset.dataSet.ref, filter.dateFilter.dataSet)
                );
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
    storeFilters?: boolean,
): IAutomationVisibleFilter[] | undefined => {
    if (!storeFilters) {
        return undefined;
    }

    const filters = (selectedFilters ?? []).map((selectedFilter) => {
        const targetFilter = (visibleFiltersMetadata ?? []).find((visibleFilter) => {
            if (isDashboardAttributeFilter(selectedFilter)) {
                return selectedFilter.attributeFilter.localIdentifier === visibleFilter.localIdentifier;
            } else {
                return selectedFilter.dateFilter.localIdentifier === visibleFilter.localIdentifier;
            }
        });

        if (targetFilter && isDashboardDateFilter(selectedFilter)) {
            return {
                ...targetFilter,
                isAllTimeDateFilter: isAllTimeDashboardDateFilter(selectedFilter),
            };
        }

        return targetFilter;
    });

    return compact(filters);
};

/**
 * Get final execution filters for the widget alert or scheduled export.
 */
export const getAppliedWidgetFilters = (
    selectedAutomationFilters: FilterContextItem[],
    dashboardHiddenFilters: FilterContextItem[],
    widget: ExtendedDashboardWidget | undefined,
    insight: IInsight | undefined,
    commonDateFilterId: string | undefined,
) => {
    // Hidden filters are never included in selectedAutomationFilters,
    // but we need them to construct proper execution filters, so merge them.
    const selectedFiltersWithHiddenFilters = [...selectedAutomationFilters, ...dashboardHiddenFilters];

    // Now, remove ignored filters (some of the hidden filters might be ignored).
    const selectedFiltersWithoutIgnoredFilters = removeIgnoredWidgetFilters(
        selectedFiltersWithHiddenFilters,
        widget,
    );

    // Now, convert sanitized selected filters to execution filters shape.
    const selectedExecutionFilters = isInsightWidget(widget)
        ? filterContextItemsToDashboardFiltersByWidget(selectedFiltersWithoutIgnoredFilters, widget)
        : [];

    // Merge the selected filters with the insight filters.
    // This will construct proper filters that should be applied to alert/scheduled export execution.
    const mergedFilters = mergeFilters(
        insight?.insight?.filters ?? [],
        selectedExecutionFilters,
        commonDateFilterId,
    );

    // And finally, strip all-time date filters - we don't want to save them, they have no effect on execution.
    return mergedFilters.filter((f) => {
        if (isDateFilter(f)) {
            return !isAllTimeDateFilterFixed(f);
        }

        return true;
    });
};

/**
 * Get final filters for the dashboard scheduled export.
 */
export const getAppliedDashboardFilters = (
    selectedAutomationFilters: FilterContextItem[],
    dashboardHiddenFilters: FilterContextItem[],
    storeFilters?: boolean,
) => {
    if (!storeFilters) {
        return undefined;
    }
    // Hidden filters are never included in selectedAutomationFilters,
    // but we need them to construct proper execution filters, so merge them.
    const selectedFiltersWithHiddenFilters = [...selectedAutomationFilters, ...dashboardHiddenFilters];

    // And finally, strip all-time date filters - we don't want to save them, they have no effect on execution.
    return selectedFiltersWithHiddenFilters.filter((f) => {
        if (isDashboardDateFilter(f)) {
            return !isAllTimeDashboardDateFilter(f);
        }

        return true;
    });
};

export const getNonHiddenFilters = (
    filters: FilterContextItem[] | undefined,
    attributeConfigs: IDashboardAttributeFilterConfig[],
    dateConfigs: IDashboardDateFilterConfigItem[],
    isCommonDateFilterHidden: boolean,
): FilterContextItem[] => {
    return (filters ?? []).filter((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const config = attributeConfigs.find(
                (attribute) => attribute.localIdentifier === filter.attributeFilter.localIdentifier,
            );
            return config?.mode !== "hidden";
        } else if ((isDashboardCommonDateFilter as (filter: FilterContextItem) => boolean)(filter)) {
            return !isCommonDateFilterHidden;
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
 * Analytical Designer is storing all-time date filters inconsistently,
 * it does not use ALL_TIME_GRANULARITY, but instead stores it as relative date filter without from / to values.
 * This function is used to fix this inconsistency.
 */
export function isAllTimeDateFilterFixed(f: IFilter): boolean {
    // Standard check for all-time date filter.
    if (isAllTimeDateFilter(f)) {
        return true;
    }

    // This is the case when all-time date filter is stored as relative date filter without from / to value from Analytical Designer.
    if (isRelativeDateFilter(f)) {
        return (
            (f.relativeDateFilter.from === null || f.relativeDateFilter.from === undefined) &&
            (f.relativeDateFilter.to === null || f.relativeDateFilter.to === undefined)
        );
    }

    // This is not likely, just for sake of safety.
    if (isAbsoluteDateFilter(f)) {
        return (
            (f.absoluteDateFilter.from === null || f.absoluteDateFilter.from === undefined) &&
            (f.absoluteDateFilter.to === null || f.absoluteDateFilter.to === undefined)
        );
    }

    return false;
}

export function areFiltersEqual(filter1: IFilter, filter2: IFilter): boolean {
    if (isAttributeFilter(filter1) && isAttributeFilter(filter2)) {
        const filter1Ref = filterObjRef(filter1);
        const filter1Values = [...getAttributeElementsItems(filterAttributeElements(filter1))].sort();
        const filter2Ref = filterObjRef(filter2);
        const filter1Type = isPositiveAttributeFilter(filter1) ? "positive" : "negative";
        const filter2Values = [...getAttributeElementsItems(filterAttributeElements(filter2))].sort();
        const filter2Type = isPositiveAttributeFilter(filter2) ? "positive" : "negative";

        return (
            areObjRefsEqual(filter1Ref, filter2Ref) &&
            isEqual(filter1Values, filter2Values) &&
            filter1Type === filter2Type
        );
    } else if (isDateFilter(filter1) && isDateFilter(filter2)) {
        return isEqual(dateFilterValues(filter1), dateFilterValues(filter2));
    }

    // Filter types are different
    return isEqual(filter1, filter2);
}

export function dateFilterValues(filter: IDateFilter) {
    if (isAbsoluteDateFilter(filter)) {
        return absoluteDateFilterValues(filter);
    }

    return relativeDateFilterValues(filter);
}

export function isFilterIgnoredByWidget(filter: FilterContextItem, widget: ExtendedDashboardWidget): boolean {
    if (!isInsightWidget(widget)) {
        return false;
    }

    return isDashboardCommonDateFilter(filter)
        ? !widget.dateDataSet
        : widget.ignoreDashboardFilters.some((ignoredFilter) => {
              if (isDashboardDateFilter(filter) && ignoredFilter.type === "dateFilterReference") {
                  return areObjRefsEqual(ignoredFilter.dataSet, filter.dateFilter.dataSet);
              }

              if (isDashboardAttributeFilter(filter) && ignoredFilter.type === "attributeFilterReference") {
                  return areObjRefsEqual(ignoredFilter.displayForm, filter.attributeFilter.displayForm);
              }

              return false;
          });
}

export function isFilterMatch(filter1: IFilter, filter2: IFilter): boolean {
    const localId1 = filterLocalIdentifier(filter1);
    const localId2 = filterLocalIdentifier(filter2);

    if (localId1 === localId2) {
        return true;
    }

    if (isDateFilter(filter1) && isDateFilter(filter2)) {
        return areObjRefsEqual(filterObjRef(filter1), filterObjRef(filter2));
    }

    return false;
}

export function removeIgnoredWidgetFilters(
    filters: FilterContextItem[],
    widget: ExtendedDashboardWidget | undefined,
) {
    if (!isInsightWidget(widget)) {
        return filters;
    }

    return filters.filter((filter) =>
        isDashboardCommonDateFilter(filter)
            ? !!widget.dateDataSet
            : !widget.ignoreDashboardFilters.some((ignoredFilter) => {
                  if (isDashboardDateFilter(filter) && ignoredFilter.type === "dateFilterReference") {
                      return areObjRefsEqual(ignoredFilter.dataSet, filter.dateFilter.dataSet);
                  }

                  if (
                      isDashboardAttributeFilter(filter) &&
                      ignoredFilter.type === "attributeFilterReference"
                  ) {
                      return areObjRefsEqual(ignoredFilter.displayForm, filter.attributeFilter.displayForm);
                  }

                  return false;
              }),
    );
}
