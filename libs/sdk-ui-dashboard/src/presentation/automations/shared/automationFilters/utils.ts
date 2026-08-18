// (C) 2025-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type IntlShape } from "react-intl";

import {
    type FilterContextItem,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type ICatalogMeasure,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardMeasureValueFilterConfig,
    type IDateFilter,
    type IFilter,
    type ObjRef,
    absoluteDateFilterValues,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    getAttributeElementsItems,
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    isArbitraryAttributeFilter,
    isAttributeFilter,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    isDateFilter,
    isInsightWidget,
    isMatchAttributeFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";

import { type ExtendedDashboardWidget } from "../../../../model/types/layoutTypes.js";

export const getFilterLocalIdentifier = (filter: FilterContextItem): string | undefined => {
    return dashboardFilterLocalIdentifier(filter);
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

/**
 * Returns `filters` with the entry matching `changed` (by filter local identifier) replaced by
 * `changed`; non-matching entries keep their references.
 */
export function applyFilterChange(
    filters: FilterContextItem[],
    changed: FilterContextItem,
): FilterContextItem[] {
    return filters.map((filter) => (areFiltersMatchedByIdentifier(filter, changed) ? changed : filter));
}

/**
 * Returns `filters` without the entry matching `toRemove` (by filter local identifier).
 */
export function removeFilterFrom(
    filters: FilterContextItem[],
    toRemove: FilterContextItem,
): FilterContextItem[] {
    return filters.filter((filter) => !areFiltersMatchedByIdentifier(filter, toRemove));
}

function getCatalogItemTargets(
    catalogItemRef: ObjRef,
    attributes: ICatalogAttribute[],
    dateDatasets: ICatalogDateDataset[],
): { attributeDisplayForms: ObjRef[]; dateDataSets: ICatalogDateDataset[] } {
    // The dropdown may emit a different display form than the filter uses, so all display forms
    // of the owning attribute are candidates.
    const attributeDisplayForms =
        attributes
            .find((attribute) => attribute.displayForms.some((df) => areObjRefsEqual(df.ref, catalogItemRef)))
            ?.displayForms?.map((df) => df.ref) ?? [];
    const dateDataSets = dateDatasets.filter((ds) => areObjRefsEqual(ds.dataSet.ref, catalogItemRef));
    return { attributeDisplayForms, dateDataSets };
}

/**
 * Resolves the filter to add for a catalog item picked in the Add dropdown, searching `candidates`
 * (the not-yet-selected filters). Attribute items match through every display form of the owning
 * attribute, date items through their dataset, measure items by the metric's own ref (MVF only).
 */
export function resolveFilterToAdd(
    catalogItemRef: ObjRef,
    candidates: FilterContextItem[],
    attributes: ICatalogAttribute[],
    dateDatasets: ICatalogDateDataset[],
): FilterContextItem | undefined {
    const { attributeDisplayForms, dateDataSets } = getCatalogItemTargets(
        catalogItemRef,
        attributes,
        dateDatasets,
    );

    const attributeFilter = attributeDisplayForms.reduce<FilterContextItem | undefined>(
        (acc, displayFormRef) => acc || getFilterByCatalogItemRef(displayFormRef, candidates),
        undefined,
    );
    const dateFilter = dateDataSets.reduce<FilterContextItem | undefined>(
        (acc, dateDataSet) => acc || getFilterByCatalogItemRef(dateDataSet.dataSet.ref, candidates),
        undefined,
    );
    // For MVF: the dropdown emits the metric's catalog ref directly; look it up by ref.
    const measureFilter = getFilterByCatalogItemRef(catalogItemRef, candidates);

    return (
        attributeFilter ||
        dateFilter ||
        (measureFilter && isDashboardMeasureValueFilter(measureFilter) ? measureFilter : undefined)
    );
}

/**
 * By-tab variant of {@link resolveFilterToAdd}: searches a tab's `availableFilters` by filter
 * shape. Deliberately not converged with the flat resolver — the candidate sets differ
 * (available vs non-selected), so unifying them changes duplicate-add behavior.
 */
export function resolveTabFilterToAdd(
    catalogItemRef: ObjRef,
    availableFilters: FilterContextItem[],
    attributes: ICatalogAttribute[],
    dateDatasets: ICatalogDateDataset[],
): FilterContextItem | undefined {
    const { attributeDisplayForms, dateDataSets } = getCatalogItemTargets(
        catalogItemRef,
        attributes,
        dateDatasets,
    );

    return availableFilters.find((f) => {
        if (isDashboardAttributeFilterItem(f)) {
            return attributeDisplayForms.some((dfRef) =>
                areObjRefsEqual(dashboardAttributeFilterItemDisplayForm(f), dfRef),
            );
        } else if (isDashboardDateFilter(f)) {
            return dateDataSets.some((ds) => areObjRefsEqual(f.dateFilter.dataSet, ds.dataSet.ref));
        } else if (isDashboardMeasureValueFilter(f)) {
            return areObjRefsEqual(f.dashboardMeasureValueFilter.measure, catalogItemRef);
        }
        return false;
    });
}

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
            if (isDashboardAttributeFilterItem(filter)) {
                const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
                const displayForm = dashboardAttributeFilterItemDisplayForm(filter);
                return (
                    localIdentifier &&
                    !ignoredLocalIdentifiers.includes(localIdentifier) &&
                    attribute.displayForms.some((attributeDisplayForm) => {
                        return areObjRefsEqual(attributeDisplayForm.ref, displayForm);
                    })
                );
            }

            return false;
        });
    });
};

export const getCatalogMeasuresByFilters = (
    filters: FilterContextItem[],
    measures: ICatalogMeasure[],
    mvfConfigs: IDashboardMeasureValueFilterConfig[],
): ICatalogMeasure[] => {
    const ignoredLocalIdentifiers = mvfConfigs
        .filter((config) => config.mode === "hidden")
        .map((config) => config.localIdentifier);

    return measures.filter((measure) => {
        return filters.some((filter) => {
            if (isDashboardMeasureValueFilter(filter)) {
                const localIdentifier = filter.dashboardMeasureValueFilter.localIdentifier;
                return (
                    !ignoredLocalIdentifiers.includes(localIdentifier) &&
                    areObjRefsEqual(filter.dashboardMeasureValueFilter.measure, measure.measure.ref)
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
        if (isDashboardAttributeFilterItem(filter)) {
            return areObjRefsEqual(dashboardAttributeFilterItemDisplayForm(filter), ref);
        } else if (isDashboardDateFilter(filter)) {
            return areObjRefsEqual(filter.dateFilter.dataSet, ref);
        } else if (isDashboardMeasureValueFilter(filter)) {
            return areObjRefsEqual(filter.dashboardMeasureValueFilter.measure, ref);
        }
        return false;
    });
};

export const getNonHiddenFilters = (
    filters: FilterContextItem[] | undefined,
    attributeConfigs: IDashboardAttributeFilterConfig[],
    dateConfigs: IDashboardDateFilterConfigItem[],
    isCommonDateFilterHidden: boolean,
    disableDateFilters: boolean,
): FilterContextItem[] => {
    return (filters ?? []).filter((filter) => {
        if (isDashboardAttributeFilterItem(filter)) {
            const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
            const config = attributeConfigs.find(
                (attribute) => attribute.localIdentifier === localIdentifier,
            );
            return config?.mode !== "hidden";
        } else if ((isDashboardCommonDateFilter as (filter: FilterContextItem) => boolean)(filter)) {
            return !isCommonDateFilterHidden && !disableDateFilters;
        } else if (isDashboardDateFilter(filter)) {
            const config = dateConfigs.find((date) =>
                areObjRefsEqual(date.dateDataSet, filter.dateFilter.dataSet),
            );
            return config?.config.mode !== "hidden" && !disableDateFilters;
        } else {
            // New filter types (arbitrary, match) - show by default
            return true;
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
        const filter2Ref = filterObjRef(filter2);

        if (isArbitraryAttributeFilter(filter1) && isArbitraryAttributeFilter(filter2)) {
            return (
                areObjRefsEqual(filter1Ref, filter2Ref) &&
                isEqual(filter1.arbitraryAttributeFilter.values, filter2.arbitraryAttributeFilter.values) &&
                (filter1.arbitraryAttributeFilter.negativeSelection ?? false) ===
                    (filter2.arbitraryAttributeFilter.negativeSelection ?? false)
            );
        }

        if (isMatchAttributeFilter(filter1) && isMatchAttributeFilter(filter2)) {
            const m1 = filter1.matchAttributeFilter;
            const m2 = filter2.matchAttributeFilter;
            return (
                areObjRefsEqual(filter1Ref, filter2Ref) &&
                m1.literal === m2.literal &&
                m1.operator === m2.operator &&
                (m1.caseSensitive ?? false) === (m2.caseSensitive ?? false) &&
                (m1.negativeSelection ?? false) === (m2.negativeSelection ?? false)
            );
        }

        if (
            (isPositiveAttributeFilter(filter1) && isPositiveAttributeFilter(filter2)) ||
            (isNegativeAttributeFilter(filter1) && isNegativeAttributeFilter(filter2))
        ) {
            const filter1Values = [...getAttributeElementsItems(filterAttributeElements(filter1))].sort();
            const filter1Type = isPositiveAttributeFilter(filter1) ? "positive" : "negative";
            const filter2Values = [...getAttributeElementsItems(filterAttributeElements(filter2))].sort();
            const filter2Type = isPositiveAttributeFilter(filter2) ? "positive" : "negative";

            return (
                areObjRefsEqual(filter1Ref, filter2Ref) &&
                isEqual(filter1Values, filter2Values) &&
                filter1Type === filter2Type
            );
        }
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

              if (
                  isDashboardAttributeFilterItem(filter) &&
                  ignoredFilter.type === "attributeFilterReference"
              ) {
                  return areObjRefsEqual(
                      ignoredFilter.displayForm,
                      dashboardAttributeFilterItemDisplayForm(filter),
                  );
              }

              if (
                  isDashboardMeasureValueFilter(filter) &&
                  ignoredFilter.type === "measureValueFilterReference"
              ) {
                  return areObjRefsEqual(ignoredFilter.measure, dashboardFilterObjRef(filter));
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

export const getFilterTitle = (
    filter: FilterContextItem,
    allAttributes: ICatalogAttribute[],
    allDateDatasets: ICatalogDateDataset[],
    intl: IntlShape,
): string => {
    if (isDashboardAttributeFilter(filter)) {
        const attribute = allAttributes.find((attr) =>
            attr.displayForms.some((df) => areObjRefsEqual(df.ref, filter.attributeFilter.displayForm)),
        );
        return attribute?.attribute.title || "";
    }

    if (isDashboardArbitraryAttributeFilter(filter)) {
        const attribute = allAttributes.find((attr) =>
            attr.displayForms.some((df) =>
                areObjRefsEqual(df.ref, filter.arbitraryAttributeFilter.displayForm),
            ),
        );
        return filter.arbitraryAttributeFilter.title || attribute?.attribute.title || "";
    }

    if (isDashboardMatchAttributeFilter(filter)) {
        const attribute = allAttributes.find((attr) =>
            attr.displayForms.some((df) => areObjRefsEqual(df.ref, filter.matchAttributeFilter.displayForm)),
        );
        return filter.matchAttributeFilter.title || attribute?.attribute.title || "";
    }

    if (isDashboardDateFilter(filter)) {
        // Handle common date filter (no specific dataSet)
        if (!filter.dateFilter.dataSet) {
            return intl.formatMessage({ id: "dateFilterDropdown.title" });
        }

        const dateDataset = allDateDatasets.find((ds) =>
            areObjRefsEqual(ds.dataSet.ref, filter.dateFilter.dataSet),
        );
        return dateDataset?.dataSet.title || "";
    }

    if (isDashboardMeasureValueFilter(filter)) {
        return filter.dashboardMeasureValueFilter.title || "";
    }

    return "";
};
