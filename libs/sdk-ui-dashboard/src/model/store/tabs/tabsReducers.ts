// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { ObjRef } from "@gooddata/sdk-model";

import { initializeFilterContext } from "./filterContext/filterContextUtils.js";
import { TabState, TabsState } from "./tabsState.js";

/**
 * @alpha
 */
export type TabsReducer<A extends Action> = CaseReducer<TabsState, A>;

type SetTabsPayload = {
    /**
     * Array of tabs with their configurations.
     */
    tabs?: TabState[];

    /**
     * Local identifier of the currently active tab.
     */
    activeTabLocalIdentifier?: string;
};

/**
 * Applies initialization logic to a tab's filterContext if present.
 * Ensures filters have local identifiers and proper ordering.
 */
function initializeTabFilterContext(tab: TabState): TabState {
    if (!tab.filterContext?.filterContextDefinition) {
        return tab;
    }

    return {
        ...tab,
        filterContext: initializeFilterContext(
            tab.filterContext.filterContextDefinition,
            tab.filterContext.originalFilterContextDefinition,
            tab.filterContext.attributeFilterDisplayForms,
            tab.filterContext.filterContextIdentity,
        ),
    };
}

/**
 * Sets the tabs and active tab ID in the state.
 * Applies initialization logic to each tab's filter context to ensure proper state structure.
 *
 * @remarks
 * This reducer ensures that all filter contexts are properly initialized with:
 * - Local identifiers for all attribute filters
 * - Proper filter ordering (common date filter first)
 * - Initialized working filter context
 * - Default values for all required fields
 *
 * Note: We return a new state object instead of mutating to ensure Immer properly handles the initialization.
 */
const setTabs: TabsReducer<PayloadAction<SetTabsPayload>> = (state, action) => {
    const { tabs, activeTabLocalIdentifier } = action.payload;

    // Process each tab to apply initialization logic from respective config reducers
    const processedTabs = tabs?.map((tab) => {
        // Apply filterContext initialization logic
        return initializeTabFilterContext(tab);
    });

    return {
        ...state,
        tabs: processedTabs,
        activeTabLocalIdentifier,
    };
};

/**
 * Sets only the active tab local identifier without changing the tabs array.
 */
const setActiveTabLocalIdentifier: TabsReducer<PayloadAction<string | undefined>> = (state, action) => {
    state.activeTabLocalIdentifier = action.payload;
};

/**
 * Updates a specific tab by identifier.
 * Applies initialization logic to ensure the tab's state is properly structured.
 */
const updateTab: TabsReducer<PayloadAction<TabState>> = (state, action) => {
    const updatedTab = action.payload;
    if (state.tabs) {
        const index = state.tabs.findIndex((tab) => tab.localIdentifier === updatedTab.localIdentifier);
        if (index !== -1) {
            // Apply initialization logic to the updated tab
            state.tabs[index] = initializeTabFilterContext(updatedTab);
        }
    }
};

/**
 * Removes a tab by its identifier. If the tab does not exist, no changes are made.
 */
const removeTabById: TabsReducer<PayloadAction<string>> = (state, action) => {
    const tabId = action.payload;
    state.tabs = state.tabs?.filter((tab) => tab.localIdentifier !== tabId);
    // Do not touch activeTabId here; handlers set it explicitly based on UX flow.
};

/**
 * Clears all tabs from the state.
 */
const clearTabs: TabsReducer<PayloadAction> = (state) => {
    state.tabs = undefined;
    state.activeTabLocalIdentifier = undefined;
};

/**
 * Payload of the {@link SetDashboardAttributeFilterConfigDisplayAsLabel} command.
 * @alpha
 */
export interface SetDashboardAttributeFilterConfigDisplayAsLabelPayload {
    /**
     * Local identifier of the filter to change display as label (= display form).
     */
    localIdentifier: string;
    /**
     *  Display as label of the attribute filter. Used to present filter in UI
     */
    displayAsLabel: ObjRef | undefined;
}

export const tabsReducers = {
    setTabs,
    setActiveTabLocalIdentifier,
    updateTab,
    removeTabById,
    clearTabs,
};
