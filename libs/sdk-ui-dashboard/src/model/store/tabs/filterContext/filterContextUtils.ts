// (C) 2021-2025 GoodData Corporation

import { partition } from "lodash-es";

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardObjectIdentity,
    type IFilterContextDefinition,
    areObjRefsEqual,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import type { FilterContextState, IWorkingFilterContextDefinition } from "./filterContextState.js";
import { generateFilterLocalIdentifier } from "../../_infra/generators.js";

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
        } else if (isDashboardDateFilter(appliedFilter)) {
            const workingFilter: IDashboardDateFilter | undefined = workingFilterContext?.filters
                ?.filter(isDashboardDateFilter)
                .find(
                    (item) =>
                        areObjRefsEqual(item.dateFilter.dataSet, appliedFilter.dateFilter.dataSet) ||
                        (!item.dateFilter.dataSet && !appliedFilter.dateFilter.dataSet), // common date filter
                );
            if (!workingFilter?.dateFilter) {
                return appliedFilter;
            }

            const dateFilter = {
                dateFilter: {
                    ...appliedFilter.dateFilter,
                    type: workingFilter.dateFilter.type,
                    granularity: workingFilter.dateFilter.granularity,
                    from: workingFilter.dateFilter.from,
                    to: workingFilter.dateFilter.to,
                    boundedFilter: workingFilter.dateFilter.boundedFilter,
                },
            };

            const { from, to } = dateFilter.dateFilter;

            if (from === undefined && to === undefined) {
                delete dateFilter.dateFilter.from;
                delete dateFilter.dateFilter.to;
            }

            return dateFilter;
        } else {
            throw new Error("Unknown filter type");
        }
    });

    const appliedCommonDateFilter = filterContext.filters.find(isDashboardCommonDateFilter);
    const workingCommonDateFilter = workingFilterContext?.filters.find(isDashboardCommonDateFilter);

    if (
        appliedCommonDateFilter ||
        !workingCommonDateFilter ||
        (isAllTimeDashboardDateFilter(workingCommonDateFilter) && !appliedCommonDateFilter)
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
    // Make sure attribute filters always have localId
    const filtersWithLocalId = filterContextDefinition.filters?.map((filter: FilterContextItem, i) =>
        isDashboardAttributeFilter(filter)
            ? {
                  attributeFilter: {
                      ...filter.attributeFilter,
                      localIdentifier:
                          filter.attributeFilter.localIdentifier ??
                          generateFilterLocalIdentifier(filter.attributeFilter.displayForm, i),
                  },
              }
            : filter,
    );

    // Make sure that common date filter is always first if present
    // (when DateFilter is set to all time it's missing in filterContextDefinition and originalFilterContextDefinition)
    // We have to keep order of rest of array (attributeFilters and date filters with dimension)
    // it represents order of filters in filter bar
    const [commonDateFilter, otherFilters] = partition(filtersWithLocalId, isDashboardCommonDateFilter);
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
    if (isDashboardDateFilter(filter)) {
        return (
            (filter.dateFilter.dataSet && objRefToString(filter.dateFilter.dataSet)) ?? "default_date_filter"
        );
    }
    throw new Error("Unknown filter type");
}
