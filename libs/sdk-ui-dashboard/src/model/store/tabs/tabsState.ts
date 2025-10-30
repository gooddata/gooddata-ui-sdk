// (C) 2025 GoodData Corporation

import { IDashboardTab } from "@gooddata/sdk-model";

import { ExtendedDashboardWidget } from "../../types/layoutTypes.js";

/**
 * @alpha
 */
export interface TabsState {
    /**
     * Array of tabs with their configurations.
     */
    tabs?: IDashboardTab<ExtendedDashboardWidget>[];

    /**
     * Identifier of the currently active tab.
     */
    activeTabId?: string;
}

export const tabsInitialState: TabsState = {
    tabs: undefined,
    activeTabId: undefined,
};
