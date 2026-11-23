// (C) 2026 GoodData Corporation

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IDashboard,
    type IFilter,
    isAbsoluteGranularityDateFilter,
    isDashboardAbsoluteGranularityDateFilter,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

export const ABSOLUTE_GRANULARITY_DATE_FILTER_NOT_SUPPORTED =
    "Dashboards do not support absolute date filters with granularity yet.";

export function containsAbsoluteGranularityDateFilter(
    filters: (FilterContextItem | IFilter)[] | undefined,
): boolean {
    return !!filters?.some(isDashboardAbsoluteGranularityDateFilter);
}

export function assertNoAbsoluteGranularityDateFilter(
    filters: (FilterContextItem | IFilter)[] | undefined,
): void {
    if (containsAbsoluteGranularityDateFilter(filters)) {
        throw new NotSupported(ABSOLUTE_GRANULARITY_DATE_FILTER_NOT_SUPPORTED);
    }
}

function dashboardFilterContextFilters(dashboard: IDashboard | undefined): FilterContextItem[] {
    return [dashboard?.filterContext, ...(dashboard?.tabs ?? []).map((tab) => tab.filterContext)].flatMap(
        (filterContext) => filterContext?.filters ?? [],
    );
}

export function dashboardContainsAbsoluteGranularityDateFilter(dashboard: IDashboard | undefined): boolean {
    return containsAbsoluteGranularityDateFilter(dashboardFilterContextFilters(dashboard));
}

export function automationContainsAbsoluteGranularityDateFilter(
    automation: IAutomationMetadataObject | undefined,
): boolean {
    const exportFilters = (automation?.exportDefinitions ?? []).flatMap(
        ({ requestPayload }): (IFilter | FilterContextItem)[] => {
            if (isExportDefinitionVisualizationObjectRequestPayload(requestPayload)) {
                return requestPayload.content.filters ?? [];
            }
            if (isExportDefinitionDashboardRequestPayload(requestPayload)) {
                return [
                    ...(requestPayload.content.filters ?? []),
                    ...Object.values(requestPayload.content.filtersByTab ?? {}).flat(),
                ];
            }
            return [];
        },
    );
    const filters: (IFilter | FilterContextItem)[] = [
        ...(automation?.alert?.execution.filters ?? []),
        ...exportFilters,
    ];
    return filters.some(
        (filter) =>
            isDashboardAbsoluteGranularityDateFilter(filter) || isAbsoluteGranularityDateFilter(filter),
    );
}

/**
 * The dashboard cannot show or apply these filters, so it fails to load instead of dropping them.
 */
export function assertNoAbsoluteGranularityDateFilterInDashboards(
    dashboards: (IDashboard | undefined)[],
    overrideDefaultFilters: FilterContextItem[] | undefined,
): void {
    assertNoAbsoluteGranularityDateFilter([
        ...(overrideDefaultFilters ?? []),
        ...dashboards.flatMap(dashboardFilterContextFilters),
    ]);
}
