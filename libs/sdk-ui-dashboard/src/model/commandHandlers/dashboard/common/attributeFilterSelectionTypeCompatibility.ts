// (C) 2025-2026 GoodData Corporation

import {
    type DashboardAttributeFilterItem,
    type DashboardAttributeFilterSelectionType,
    isDashboardAttributeFilter,
    isSingleSelectionFilter,
} from "@gooddata/sdk-model";

/**
 * Checks if a filter kind ("list" vs "text") is compatible with the dashboard attribute filter config's
 * {@link DashboardAttributeFilterSelectionType}, using the same defaulting rules as filter context
 * merging and filter views.
 *
 * @param filterType - "list" for element selection, "text" for arbitrary/match
 * @param configSelectionType - selectionType from attribute filter config, if set
 * @param defaultSelectionType - implicit selection type when config omits selectionType
 */
export function isFilterTypeCompatibleWithSelectionType(
    filterType: "list" | "text",
    configSelectionType: DashboardAttributeFilterSelectionType | undefined,
    defaultSelectionType: "list" | "text" | "listOrText" = "listOrText",
): boolean {
    const effectiveSelectionType = configSelectionType ?? defaultSelectionType;
    if (effectiveSelectionType === "listOrText") {
        return true;
    }
    return effectiveSelectionType === filterType;
}

/**
 * Checks if applying an incoming filter type ("list" or "text") is compatible with the target
 * dashboard filter's selection type config.
 *
 * Encapsulates the default selection type rule:
 * - Single-selection list filters default to "list"
 * - All other filters (non-single list, text) default to "listOrText"
 *
 * @param incomingFilterType - "list" for element selection, "text" for arbitrary/match
 * @param configSelectionType - selectionType from the target filter's attribute filter config, if set
 * @param targetFilter - the target dashboard filter item to check against
 */
export function canApplyFilterTypeToTarget(
    incomingFilterType: "list" | "text",
    configSelectionType: DashboardAttributeFilterSelectionType | undefined,
    targetFilter: DashboardAttributeFilterItem,
): boolean {
    const defaultType =
        isDashboardAttributeFilter(targetFilter) && isSingleSelectionFilter(targetFilter)
            ? "list"
            : "listOrText";
    return isFilterTypeCompatibleWithSelectionType(incomingFilterType, configSelectionType, defaultType);
}
