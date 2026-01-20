// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type ObjRef } from "@gooddata/sdk-model";

import { initializeFilterContext } from "./filterContext/filterContextUtils.js";
import { type ITabState, type ITabsState } from "./tabsState.js";

/**
 * @alpha
 */
export type TabsReducer<A extends Action> = CaseReducer<ITabsState, A>;

type SetTabsPayload = {
    /**
     * Array of tabs with their configurations.
     */
    tabs?: ITabState[];

    /**
     * Local identifier of the currently active tab.
     */
    activeTabLocalIdentifier?: string;
};

/**
 * Applies initialization logic to a tab's filterContext if present.
 * Ensures filters have local identifiers and proper ordering.
 */
function initializeTabFilterContext(tab: ITabState): ITabState {
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
const updateTab: TabsReducer<PayloadAction<ITabState>> = (state, action) => {
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
export interface ISetDashboardAttributeFilterConfigDisplayAsLabelPayload {
    /**
     * Local identifier of the filter to change display as label (= display form).
     */
    localIdentifier: string;
    /**
     *  Display as label of the attribute filter. Used to present filter in UI
     */
    displayAsLabel: ObjRef | undefined;
}

/**
 * Sets isRenaming flag on a particular tab.
 * Note: this is internal UI state and not part of the public model
 */
const setTabIsRenaming: TabsReducer<PayloadAction<{ tabId: string; isRenaming: boolean }>> = (
    state,
    action,
) => {
    const { tabId, isRenaming } = action.payload;

    const tab = state.tabs?.find((tab) => tab.localIdentifier === tabId);

    if (!tab) {
        return;
    }

    tab.isRenaming = isRenaming;
};

/**
 * Renames a tab by id
 */
const renameTab: TabsReducer<PayloadAction<{ tabId: string; title: string }>> = (state, action) => {
    const { tabId, title } = action.payload;
    const tab = state.tabs?.find((tab) => tab.localIdentifier === tabId);

    if (!tab) {
        return;
    }

    tab.title = title;
};

export const tabsReducers = {
    setTabs,
    setActiveTabLocalIdentifier,
    updateTab,
    removeTabById,
    clearTabs,
    setTabIsRenaming,
    renameTab,
};
