// (C) 2026 GoodData Corporation

import type { FilterContextItem } from "@gooddata/sdk-model";

/**
 * Automation filters grouped by tab, returned by {@link selectAutomationFiltersByTab}.
 * @alpha
 */
export interface IAutomationFiltersTab {
    /**
     * Tab local identifier.
     */
    tabId: string;
    /**
     * Tab title.
     */
    tabTitle: string;
    /**
     * Automation-available filters for the tab (hidden filters removed).
     */
    availableFilters: FilterContextItem[];
    /**
     * Default selected filters for the tab
     * (no-op filters removed: "all values" attribute filters and "all" measure value filters).
     */
    defaultSelectedFilters: FilterContextItem[];
    /**
     * Locked filters for the tab.
     */
    lockedFilters: FilterContextItem[];
    /**
     * Hidden filters for the tab.
     */
    hiddenFilters: FilterContextItem[];
}
