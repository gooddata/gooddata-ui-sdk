// (C) 2025-2026 GoodData Corporation

import { type DashboardAttributeFilterSelectionType } from "@gooddata/sdk-model";

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
    defaultSelectionType: "list" | "text",
): boolean {
    const effectiveSelectionType = configSelectionType ?? defaultSelectionType;
    if (effectiveSelectionType === "listOrText") {
        return true;
    }
    return effectiveSelectionType === filterType;
}
