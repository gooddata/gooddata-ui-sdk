// (C) 2024-2025 GoodData Corporation

import { AutomationFilterType } from "@gooddata/sdk-backend-spi";

import { STATUS_NEVER_RUN, STATUS_NEVER_RUN_RSQL_QUERY } from "../../common/automations.js";

/**
 * Builds a filter string for a field based on the filter type.
 * Returns null if value is null/undefined.
 */
export function buildFieldFilter(
    fieldPath: string,
    value: string | null,
    filterType: AutomationFilterType,
): string | null {
    if (!value) {
        return null;
    }

    if (filterType === "include") {
        return `${fieldPath}=in=(${value})`;
    }

    if (filterType === "exclude") {
        return `${fieldPath}=out=(${value})`;
    }

    return `${fieldPath}=='${value}'`;
}

/**
 * Builds a filter string for the status field.
 * Handles the special NEVER_RUN status which requires custom RSQL query.
 * Returns null if status is null/undefined.
 */
export function buildStatusFilter(
    status: string | null,
    statusFilterType: AutomationFilterType,
): string | null {
    if (!status) {
        return null;
    }

    if (statusFilterType === "include") {
        return buildIncludeStatusFilter(status);
    }

    return buildExactStatusFilter(status);
}

function buildIncludeStatusFilter(status: string): string {
    const statuses = status.split(",");
    const hasNeverRun = statuses.includes(STATUS_NEVER_RUN);

    if (!hasNeverRun) {
        return `automationResults.status=in=(${status})`;
    }

    const otherStatuses = statuses.filter((s) => s !== STATUS_NEVER_RUN);

    if (otherStatuses.length === 0) {
        return STATUS_NEVER_RUN_RSQL_QUERY;
    }

    const otherStatusesQueryValue = otherStatuses.join(",");
    return `(automationResults.status=in=(${otherStatusesQueryValue}) or ${STATUS_NEVER_RUN_RSQL_QUERY})`;
}

function buildExactStatusFilter(status: string): string {
    if (status === STATUS_NEVER_RUN) {
        return STATUS_NEVER_RUN_RSQL_QUERY;
    }

    return `automationResults.status=='${status}'`;
}
