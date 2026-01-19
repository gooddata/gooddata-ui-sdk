// (C) 2025-2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";

import { type AttributeFilterConfigsState } from "./attributeFilterConfigs/attrtibuteFilterConfigsState.js";
import type { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState.js";
import { type DateFilterConfigsState } from "./dateFilterConfigs/dateFilterConfigsState.js";
import type { FilterContextState } from "./filterContext/filterContextState.js";
import type { LayoutState } from "./layout/layoutState.js";

/**
 * Identifier used for dashboards without explicit tabs support and the first tab created automatically.
 *
 * @internal
 */
export const DEFAULT_TAB_ID = "defaultTabId";

export const getActiveTab = (state: TabsState): TabState | undefined => {
    if (!state.tabs || !state.activeTabLocalIdentifier) {
        return;
    }
    return state.tabs.find((tab) => tab.localIdentifier === state.activeTabLocalIdentifier);
};

/**
 * Gets a tab by its local identifier, or the active tab if no identifier is provided.
 *
 * @param state - The tabs state
 * @param tabLocalIdentifier - Optional tab local identifier. If not provided, returns the active tab.
 * @returns The tab state or undefined if not found
 *
 * @internal
 */
export const getTabOrActive = (state: TabsState, tabLocalIdentifier?: string): TabState | undefined => {
    if (!state.tabs) {
        return;
    }
    if (tabLocalIdentifier) {
        return state.tabs.find((tab) => tab.localIdentifier === tabLocalIdentifier);
    }
    return getActiveTab(state);
};

// Re-export for convenience
export type { DateFilterConfigState, FilterContextState, LayoutState };

/**
 * @alpha
 */
export interface TabState {
    title?: string;
    localIdentifier: string;

    dateFilterConfig?: DateFilterConfigState;
    dateFilterConfigs?: DateFilterConfigsState;
    attributeFilterConfigs?: AttributeFilterConfigsState;
    filterContext?: FilterContextState;
    layout?: LayoutState;

    /**
     * UI-only flag indicating the tab is currently being renamed.
     * @internal
     */
    isRenaming?: boolean;
}

/**
 * @alpha
 */
export interface TabsState {
    /**
     * Array of tabs with their configurations.
     */
    tabs?: TabState[];
    /**
     * Local identifier of the currently active tab.
     */
    activeTabLocalIdentifier?: string;
    /**
     * Attribute metadata objects with referenced objects for all attribute filters across all tabs.
     * @beta
     */
    attributesWithReferences?: IAttributeWithReferences[];
}

export const tabsInitialState: TabsState = {
    tabs: undefined,
    activeTabLocalIdentifier: undefined,
    attributesWithReferences: undefined,
};
