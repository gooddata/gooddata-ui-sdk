// (C) 2021-2025 GoodData Corporation

import {
    areObjRefsEqual,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    type FilterContextItem,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IFilterContextDefinition,
    type IWorkingFilterContextDefinition,
} from "@gooddata/sdk-model";

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
                : workingFilter.attributeFilter.displayForm ?? appliedFilter.attributeFilter.displayForm;
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
            return {
                dateFilter: {
                    ...appliedFilter.dateFilter,
                    type: workingFilter.dateFilter.type,
                    granularity: workingFilter.dateFilter.granularity,
                    from: workingFilter.dateFilter.from,
                    to: workingFilter.dateFilter.to,
                },
            };
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
