// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { IDashboardTab } from "@gooddata/sdk-model";

import { TabsState } from "./tabsState.js";
import { ExtendedDashboardWidget } from "../../types/layoutTypes.js";

type TabsReducer<A extends Action> = CaseReducer<TabsState, A>;

type SetTabsPayload = {
    /**
     * Array of tabs with their configurations.
     */
    tabs?: IDashboardTab<ExtendedDashboardWidget>[];

    /**
     * Identifier of the currently active tab.
     */
    activeTabId?: string;
};

/**
 * Sets the tabs and active tab ID in the state.
 */
const setTabs: TabsReducer<PayloadAction<SetTabsPayload>> = (state, action) => {
    const { tabs, activeTabId } = action.payload;
    state.tabs = tabs;
    state.activeTabId = activeTabId;
};

/**
 * Sets only the active tab ID without changing the tabs array.
 */
const setActiveTabId: TabsReducer<PayloadAction<string | undefined>> = (state, action) => {
    state.activeTabId = action.payload;
};

/**
 * Updates a specific tab by identifier.
 */
const updateTab: TabsReducer<PayloadAction<IDashboardTab<ExtendedDashboardWidget>>> = (state, action) => {
    const updatedTab = action.payload;
    if (state.tabs) {
        const index = state.tabs.findIndex((tab) => tab.identifier === updatedTab.identifier);
        if (index !== -1) {
            state.tabs[index] = updatedTab;
        }
    }
};

/**
 * Removes a tab by its identifier. If the tab does not exist, no changes are made.
 */
const removeTabById: TabsReducer<PayloadAction<string>> = (state, action) => {
    const tabId = action.payload;
    state.tabs = state.tabs?.filter((tab) => tab.identifier !== tabId);
    // Do not touch activeTabId here; handlers set it explicitly based on UX flow.
};

/**
 * Clears all tabs from the state.
 */
const clearTabs: TabsReducer<PayloadAction> = (state) => {
    state.tabs = undefined;
    state.activeTabId = undefined;
};

export const tabsReducers = {
    setTabs,
    setActiveTabId,
    updateTab,
    removeTabById,
    clearTabs,
};
