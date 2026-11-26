// (C) 2026 GoodData Corporation

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IDashboard,
    type IFilter,
    isDashboardParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { automationExportFilters, dashboardFilterContextFilters } from "./absoluteGranularityDateFilters.js";

export const PARAMETERIZED_DATE_FILTER_NOT_SUPPORTED =
    "Dashboards do not support parameterized date filters yet.";

export function containsDashboardParameterizedDateFilter(
    filters: (FilterContextItem | IFilter)[] | undefined,
): boolean {
    return !!filters?.some(isDashboardParameterizedDateFilter);
}

export function assertNoDashboardParameterizedDateFilter(
    filters: (FilterContextItem | IFilter)[] | undefined,
): void {
    if (containsDashboardParameterizedDateFilter(filters)) {
        throw new NotSupported(PARAMETERIZED_DATE_FILTER_NOT_SUPPORTED);
    }
}

export function dashboardContainsParameterizedDateFilter(dashboard: IDashboard | undefined): boolean {
    return containsDashboardParameterizedDateFilter(dashboardFilterContextFilters(dashboard));
}

// Alerts hold execution filters only, so only exports can hold the filter context item.
export function automationContainsDashboardParameterizedDateFilter(
    automation: IAutomationMetadataObject | undefined,
): boolean {
    return containsDashboardParameterizedDateFilter(automationExportFilters(automation));
}

/**
 * The dashboard cannot show or apply these filters, so it fails to load instead of dropping them.
 */
export function assertNoParameterizedDateFilterInDashboards(
    dashboards: (IDashboard | undefined)[],
    overrideDefaultFilters: FilterContextItem[] | undefined,
): void {
    assertNoDashboardParameterizedDateFilter([
        ...(overrideDefaultFilters ?? []),
        ...dashboards.flatMap(dashboardFilterContextFilters),
    ]);
}
