// (C) 2021-2026 GoodData Corporation

import {
    type DashboardDateFilterOfAnyType,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardObjectIdentity,
    type IFilterContextDefinition,
    areObjRefsEqual,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    dashboardMeasureValueFilterLocalIdentifier,
    isDashboardAbsoluteGranularityDateFilter,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilterOfAnyType,
    isDashboardDateFilter,
    isDashboardDateFilterOfAnyType,
    isDashboardDateFilterWithDimensionOfAnyType,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    isDashboardParameterizedDateFilter,
    isNoopAllTimeDashboardDateFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { _omitBy, _partition } from "@gooddata/util";

import { generateFilterLocalIdentifier } from "../../_infra/generators.js";

import type { FilterContextState, IWorkingFilterContextDefinition } from "./filterContextState.js";

/**
 * The working date filter replaces the applied one, also when its type differs. The applied local
 * identifier and date dataset are kept.
 */
function mergeDateFilterOfAnyType(
    appliedFilter: DashboardDateFilterOfAnyType,
    workingFilter: DashboardDateFilterOfAnyType,
): DashboardDateFilterOfAnyType {
    const localIdentifier = dashboardFilterLocalIdentifier(appliedFilter);
    const dataSet = dashboardFilterObjRef(appliedFilter);
    const identity = {
        ...(dataSet ? { dataSet } : {}),
        ...(localIdentifier ? { localIdentifier } : {}),
    };
    if (isDashboardAbsoluteGranularityDateFilter(workingFilter)) {
        return {
            dashboardAbsoluteGranularityDateFilter: {
                ...workingFilter.dashboardAbsoluteGranularityDateFilter,
                ...identity,
            },
        };
    }
    if (isDashboardParameterizedDateFilter(workingFilter)) {
        return {
            dashboardParameterizedDateFilter: {
                ...workingFilter.dashboardParameterizedDateFilter,
                ...(localIdentifier ? { localIdentifier } : {}),
            },
        };
    }
    if (
        isDashboardAbsoluteGranularityDateFilter(appliedFilter) ||
        isDashboardParameterizedDateFilter(appliedFilter)
    ) {
        const { type, granularity, ...rest } = workingFilter.dateFilter;
        // a stored filter has no keys with undefined values
        return {
            dateFilter: {
                ..._omitBy(rest, (value) => value === undefined),
                type,
                granularity,
                ...identity,
            },
        };
    }
    return mergeDateFilter(appliedFilter, workingFilter);
}

function mergeDateFilter(appliedFilter: IDashboardDateFilter, workingFilter: IDashboardDateFilter) {
    const dateFilter = {
        dateFilter: {
            ...appliedFilter.dateFilter,
            type: workingFilter.dateFilter.type,
            granularity: workingFilter.dateFilter.granularity,
            from: workingFilter.dateFilter.from,
            to: workingFilter.dateFilter.to,
            boundedFilter: workingFilter.dateFilter.boundedFilter,
            emptyValueHandling: workingFilter.dateFilter.emptyValueHandling,
        },
    };

    const { from, to } = dateFilter.dateFilter;

    if (from === undefined && to === undefined) {
        delete dateFilter.dateFilter.from;
        delete dateFilter.dateFilter.to;
    }

    return dateFilter;
}

/**
 * Deeply merges partial working filter context into filter context definition.
 * @returns full working filter context.
 *
 * @internal
 */
export function applyFilterContext(
    filterContext: IFilterContextDefinition,
    workingFilterContext: IWorkingFilterContextDefinition | undefined,
    enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean,
): IFilterContextDefinition {
    const filters = filterContext.filters.map((appliedFilter): FilterContextItem => {
        if (isDashboardAttributeFilter(appliedFilter)) {
            const workingFilter: Partial<IDashboardAttributeFilter> | undefined =
                workingFilterContext?.filters
                    ?.filter(isDashboardAttributeFilter)
                    .find(
                        (item) =>
                            item.attributeFilter?.localIdentifier ===
                            appliedFilter.attributeFilter.localIdentifier,
                    );
            if (!workingFilter?.attributeFilter) {
                // Cross-type fallback: check if a text filter replaced this list filter
                // in working context (list→text migration).
                const crossTypeFilter = workingFilterContext?.filters?.find(
                    (item) =>
                        !isDashboardAttributeFilter(item) &&
                        isDashboardAttributeFilterItem(item) &&
                        dashboardAttributeFilterItemLocalIdentifier(item) ===
                            appliedFilter.attributeFilter.localIdentifier,
                );
                if (crossTypeFilter) {
                    return crossTypeFilter as FilterContextItem;
                }
                return appliedFilter;
            }

            const displayForm = enableImmediateAttributeFilterDisplayAsLabelMigration
                ? appliedFilter.attributeFilter.displayForm
                : (workingFilter.attributeFilter.displayForm ?? appliedFilter.attributeFilter.displayForm);
            return {
                attributeFilter: {
                    ...appliedFilter.attributeFilter,
                    displayForm,
                    attributeElements:
                        workingFilter.attributeFilter.attributeElements ??
                        appliedFilter.attributeFilter.attributeElements,
                    negativeSelection:
                        workingFilter.attributeFilter.negativeSelection ??
                        appliedFilter.attributeFilter.negativeSelection,
                },
            };
        } else if (isDashboardAttributeFilterItem(appliedFilter)) {
            // Text filter types (arbitrary, match) — replace with working version if available
            const appliedLocalId = dashboardAttributeFilterItemLocalIdentifier(appliedFilter);
            const workingFilter = workingFilterContext?.filters?.find(
                (item) =>
                    isDashboardAttributeFilterItem(item) &&
                    dashboardAttributeFilterItemLocalIdentifier(item) === appliedLocalId,
            );
            return (workingFilter ?? appliedFilter) as FilterContextItem;
        } else if (isDashboardCommonDateFilterOfAnyType(appliedFilter)) {
            const workingFilter = workingFilterContext?.filters.find(isDashboardCommonDateFilterOfAnyType);
            return workingFilter ? mergeDateFilterOfAnyType(appliedFilter, workingFilter) : appliedFilter;
        } else if (isDashboardParameterizedDateFilter(appliedFilter)) {
            // the dashboard rejects parameterized date filters, they are not merged
            return appliedFilter;
        } else if (isDashboardDateFilterOfAnyType(appliedFilter)) {
            const dataSet = dashboardFilterObjRef(appliedFilter);
            const workingFilter = workingFilterContext?.filters
                ?.filter(isDashboardDateFilterWithDimensionOfAnyType)
                .find((item) => areObjRefsEqual(dashboardFilterObjRef(item), dataSet));
            return workingFilter ? mergeDateFilterOfAnyType(appliedFilter, workingFilter) : appliedFilter;
        } else if (isDashboardMeasureValueFilter(appliedFilter)) {
            const workingFilter = workingFilterContext?.filters
                ?.filter(isDashboardMeasureValueFilter)
                .find(
                    (item) =>
                        dashboardFilterLocalIdentifier(item) ===
                        appliedFilter.dashboardMeasureValueFilter.localIdentifier,
                );

            if (!workingFilter) {
                return appliedFilter;
            }

            return {
                dashboardMeasureValueFilter: {
                    ...appliedFilter.dashboardMeasureValueFilter,
                    conditions: workingFilter.dashboardMeasureValueFilter.conditions,
                },
            };
        } else {
            throw new Error("Unknown filter type");
        }
    });

    const appliedCommonDateFilter = filterContext.filters.find(isDashboardCommonDateFilterOfAnyType);
    const workingCommonDateFilter = workingFilterContext?.filters.find(isDashboardCommonDateFilterOfAnyType);

    if (
        appliedCommonDateFilter ||
        !workingCommonDateFilter ||
        // Drop the working common date filter only when it is a true no-op All time filter.
        // An All time filter that carries `emptyValueHandling` (the "Empty values" preset) is a
        // meaningful change and must be kept, otherwise the dashboard would not detect it as changed.
        (isNoopAllTimeDashboardDateFilter(workingCommonDateFilter) && !appliedCommonDateFilter)
    ) {
        return {
            ...filterContext,
            filters,
        };
    }

    return {
        ...filterContext,
        filters: [workingCommonDateFilter, ...filters],
    };
}

/**
 * Initializes filter context definition by ensuring filters have local identifiers
 * and are in proper order (common date filter first).
 *
 * @param filterContextDefinition - The filter context definition to initialize
 * @returns Initialized filter context definition with local identifiers and proper ordering
 * @internal
 */
export function initializeFilterContextDefinition(
    filterContextDefinition: IFilterContextDefinition,
): IFilterContextDefinition {
    // Make sure all attribute filter types always have localId
    const filtersWithLocalId = filterContextDefinition.filters?.map(
        (filter: FilterContextItem, i): FilterContextItem => {
            if (isDashboardAttributeFilter(filter)) {
                return {
                    attributeFilter: {
                        ...filter.attributeFilter,
                        localIdentifier:
                            filter.attributeFilter.localIdentifier ??
                            generateFilterLocalIdentifier(filter.attributeFilter.displayForm, i),
                    },
                };
            }
            if (isDashboardArbitraryAttributeFilter(filter)) {
                return {
                    arbitraryAttributeFilter: {
                        ...filter.arbitraryAttributeFilter,
                        localIdentifier:
                            filter.arbitraryAttributeFilter.localIdentifier ??
                            generateFilterLocalIdentifier(filter.arbitraryAttributeFilter.displayForm, i),
                    },
                };
            }
            if (isDashboardMatchAttributeFilter(filter)) {
                return {
                    matchAttributeFilter: {
                        ...filter.matchAttributeFilter,
                        localIdentifier:
                            filter.matchAttributeFilter.localIdentifier ??
                            generateFilterLocalIdentifier(filter.matchAttributeFilter.displayForm, i),
                    },
                };
            }
            return filter;
        },
    );

    // Make sure that common date filter is always first if present
    // (when DateFilter is set to all time it's missing in filterContextDefinition and originalFilterContextDefinition)
    // We have to keep order of rest of array (attributeFilters and date filters with dimension)
    // it represents order of filters in filter bar
    const [commonDateFilter, otherFilters] = _partition(
        filtersWithLocalId,
        isDashboardCommonDateFilterOfAnyType,
    );
    const filters = [...commonDateFilter, ...otherFilters];

    return {
        ...filterContextDefinition,
        filters,
    };
}

/**
 * Creates a complete initialized FilterContextState from raw data.
 * Applies all initialization logic including local identifiers and filter ordering.
 *
 * @param filterContextDefinition - The filter context definition
 * @param originalFilterContextDefinition - Optional original definition for reset functionality
 * @param attributeFilterDisplayForms - Display forms for attribute filters
 * @param filterContextIdentity - Optional identity for persisted filter contexts
 * @returns Fully initialized FilterContextState
 * @internal
 */
export function initializeFilterContext(
    filterContextDefinition: IFilterContextDefinition,
    originalFilterContextDefinition?: IFilterContextDefinition,
    attributeFilterDisplayForms?: IAttributeDisplayFormMetadataObject[],
    filterContextIdentity?: IDashboardObjectIdentity,
): FilterContextState {
    const initialized = initializeFilterContextDefinition(filterContextDefinition);

    return {
        filtersWithInvalidSelection: [],
        filterContextDefinition: initialized,
        workingFilterContextDefinition: { filters: [] },
        originalFilterContextDefinition,
        filterContextIdentity,
        attributeFilterDisplayForms: attributeFilterDisplayForms ?? [],
        defaultFilterOverrides: [],
    };
}

/**
 * @internal
 */
export function getFilterIdentifier(filter: FilterContextItem): string {
    if (isDashboardAttributeFilter(filter)) {
        const localIdentifier = filter.attributeFilter.localIdentifier;
        if (!localIdentifier) {
            console.warn(
                "Attribute filter without localIdentifier found. Using displayForm as fallback which may not be reliable.",
            );
            return objRefToString(filter.attributeFilter.displayForm);
        }
        return localIdentifier;
    }
    if (isDashboardAttributeFilterItem(filter)) {
        const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
        if (!localIdentifier) {
            throw new Error("Text attribute filter without localIdentifier found.");
        }
        return localIdentifier;
    }
    if (isDashboardDateFilter(filter)) {
        return (
            (filter.dateFilter.dataSet && objRefToString(filter.dateFilter.dataSet)) ?? "default_date_filter"
        );
    }
    if (isDashboardAbsoluteGranularityDateFilter(filter)) {
        const { dataSet } = filter.dashboardAbsoluteGranularityDateFilter;
        return (dataSet && objRefToString(dataSet)) ?? "default_date_filter";
    }
    if (isDashboardParameterizedDateFilter(filter)) {
        const { dataSet } = filter.dashboardParameterizedDateFilter;
        return (dataSet && objRefToString(dataSet)) ?? "default_date_filter";
    }
    if (isDashboardMeasureValueFilter(filter)) {
        return dashboardMeasureValueFilterLocalIdentifier(filter);
    }
    throw new Error("Unknown filter type");
}
