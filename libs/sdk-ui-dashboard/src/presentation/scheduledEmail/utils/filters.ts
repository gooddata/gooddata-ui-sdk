// (C) 2026 GoodData Corporation

import { type FilterContextItem } from "@gooddata/sdk-model";

import { getAppliedDashboardFilters as getAppliedDashboardFiltersFromAutomationFilters } from "../../automationFilters/utils.js";

export function getAppliedDashboardFilters(
    selectedAutomationFilters: FilterContextItem[],
    dashboardHiddenFilters: FilterContextItem[],
    storeFilters?: boolean,
) {
    return getAppliedDashboardFiltersFromAutomationFilters(
        selectedAutomationFilters,
        dashboardHiddenFilters,
        storeFilters,
    );
}
