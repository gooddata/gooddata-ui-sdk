// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { IDashboardTab } from "@gooddata/sdk-model";

import { ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.tabs,
);

/**
 * Returns all tabs with their configurations.
 *
 * @alpha
 */
export const selectTabs: DashboardSelector<IDashboardTab<ExtendedDashboardWidget>[] | undefined> =
    createSelector(selectSelf, (tabsState) => {
        return tabsState.tabs;
    });

/**
 * Returns the identifier of the currently active tab.
 *
 * @alpha
 */
export const selectActiveTabId: DashboardSelector<string | undefined> = createSelector(
    selectSelf,
    (tabsState) => {
        return tabsState.activeTabId;
    },
);

/**
 * Returns the currently active tab, or undefined if no tab is active or tabs are not present.
 *
 * @alpha
 */
export const selectActiveTab: DashboardSelector<IDashboardTab<ExtendedDashboardWidget> | undefined> =
    createSelector(selectTabs, selectActiveTabId, (tabs, activeTabId) => {
        if (!tabs || !activeTabId) {
            return undefined;
        }
        return tabs.find((tab) => tab.identifier === activeTabId);
    });

/**
 * Returns a specific tab by its identifier.
 *
 * @alpha
 */
export const selectTabById = (
    tabId: string,
): DashboardSelector<IDashboardTab<ExtendedDashboardWidget> | undefined> =>
    createSelector(selectTabs, (tabs) => {
        if (!tabs) {
            return undefined;
        }
        return tabs.find((tab) => tab.identifier === tabId);
    });

/**
 * Returns whether tabs are present in the dashboard.
 *
 * @alpha
 */
export const selectHasTabs: DashboardSelector<boolean> = createSelector(selectTabs, (tabs) => {
    return tabs !== undefined && tabs.length > 0;
});
