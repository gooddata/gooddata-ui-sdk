// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { DEFAULT_TAB_ID, TabState } from "./tabsState.js";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.tabs,
);

/**
 * Returns the full tabs state (including tabs array, activeTabLocalIdentifier, and shared state like attributesWithReferences).
 *
 * @internal
 */
export const selectTabsState = selectSelf;

/**
 * Returns all tabs with their configurations.
 *
 * @alpha
 */
export const selectTabs: DashboardSelector<TabState[] | undefined> = createSelector(
    selectSelf,
    (tabsState) => {
        return tabsState.tabs;
    },
);

/**
 * Returns the local identifier of the currently active tab.
 *
 * @alpha
 */
export const selectActiveTabLocalIdentifier: DashboardSelector<string | undefined> = createSelector(
    selectSelf,
    (tabsState) => {
        return tabsState.activeTabLocalIdentifier;
    },
);

/**
 * Returns the local identifier of the currently active tab or the default tab id
 *
 * @alpha
 */
export const selectActiveOrDefaultTabLocalIdentifier: DashboardSelector<string> = createSelector(
    selectSelf,
    (tabsState) => {
        return tabsState.activeTabLocalIdentifier ?? DEFAULT_TAB_ID;
    },
);

/**
 * Returns the currently active tab, or undefined if no tab is active or tabs are not present.
 *
 * @alpha
 */
export const selectActiveTab: DashboardSelector<TabState | undefined> = createSelector(
    selectTabs,
    selectActiveTabLocalIdentifier,
    (tabs, activeTabLocalIdentifier) => {
        if (!tabs || !activeTabLocalIdentifier) {
            return undefined;
        }
        return tabs.find((tab) => tab.localIdentifier === activeTabLocalIdentifier);
    },
);

/**
 * Returns a specific tab by its identifier.
 *
 * @alpha
 */
export const selectTabById = (tabId: string): DashboardSelector<TabState | undefined> =>
    createSelector(selectTabs, (tabs) => {
        if (!tabs) {
            return undefined;
        }
        return tabs.find((tab) => tab.localIdentifier === tabId);
    });

/**
 * Returns whether tabs are present in the dashboard.
 *
 * @alpha
 */
export const selectHasTabs: DashboardSelector<boolean> = createSelector(selectTabs, (tabs) => {
    return tabs !== undefined && tabs.length > 0;
});
