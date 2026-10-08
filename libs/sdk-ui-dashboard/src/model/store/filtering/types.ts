// (C) 2026 GoodData Corporation

import type { FilterContextItem } from "@gooddata/sdk-model";

/**
 * Automation filters grouped by tab, returned by {@link selectAutomationFiltersByTab}.
 * @beta
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
     * Filters the add-filter dropdown may offer: {@link IAutomationFiltersTab.availableFilters} minus
     * the ones the user is forbidden to read.
     */
    selectableFilters: FilterContextItem[];
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
    /**
     * Every filter of the tab except cross-filtering ones, hidden and restricted ones included.
     * A filter stored in an automation but missing here was removed from the dashboard.
     */
    allFilters: FilterContextItem[];
}
