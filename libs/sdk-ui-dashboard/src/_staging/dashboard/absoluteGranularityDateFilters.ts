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

export const ABSOLUTE_GRANULARITY_DATE_FILTER_AUTOMATIONS_NOT_SUPPORTED =
    "Automations do not support absolute date filters with granularity yet.";

export const ABSOLUTE_GRANULARITY_DATE_FILTER_DRILL_TO_DASHBOARD_NOT_SUPPORTED =
    "Drill to a dashboard does not support absolute date filters with granularity yet.";

export const ABSOLUTE_GRANULARITY_DATE_FILTER_INSIGHT_EDITOR_NOT_SUPPORTED =
    "The insight editor does not support absolute date filters with granularity yet.";

export function containsAbsoluteGranularityDateFilter(
    filters: (FilterContextItem | IFilter)[] | undefined,
): boolean {
    return !!filters?.some(isDashboardAbsoluteGranularityDateFilter);
}

export function assertNoAbsoluteGranularityDateFilter(
    filters: (FilterContextItem | IFilter)[] | undefined,
): void {
    if (containsAbsoluteGranularityDateFilter(filters)) {
        throw new NotSupported(ABSOLUTE_GRANULARITY_DATE_FILTER_AUTOMATIONS_NOT_SUPPORTED);
    }
}

export function dashboardFilterContextFilters(dashboard: IDashboard | undefined): FilterContextItem[] {
    return [dashboard?.filterContext, ...(dashboard?.tabs ?? []).map((tab) => tab.filterContext)].flatMap(
        (filterContext) => filterContext?.filters ?? [],
    );
}

export function automationExportFilters(
    automation: IAutomationMetadataObject | undefined,
): (IFilter | FilterContextItem)[] {
    return (automation?.exportDefinitions ?? []).flatMap(
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
}

export function automationContainsAbsoluteGranularityDateFilter(
    automation: IAutomationMetadataObject | undefined,
): boolean {
    const filters: (IFilter | FilterContextItem)[] = [
        ...(automation?.alert?.execution.filters ?? []),
        ...automationExportFilters(automation),
    ];
    return filters.some(
        (filter) =>
            isDashboardAbsoluteGranularityDateFilter(filter) || isAbsoluteGranularityDateFilter(filter),
    );
}
