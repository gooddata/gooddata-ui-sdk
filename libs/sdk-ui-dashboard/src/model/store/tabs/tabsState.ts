// (C) 2025 GoodData Corporation

import { IAttributeWithReferences } from "@gooddata/sdk-backend-spi";

import { AttributeFilterConfigsState } from "./attributeFilterConfigs/attrtibuteFilterConfigsState.js";
import type { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState.js";
import { DateFilterConfigsState } from "./dateFilterConfigs/dateFilterConfigsState.js";
import type { FilterContextState } from "./filterContext/filterContextState.js";
import type { LayoutState } from "./layout/layoutState.js";

/**
 * Identifier used for dashboards without explicit tabs support.
 *
 * @internal
 */
export const DEFAULT_TAB_ID = "defaultTabId";

export const getActiveTab = (state: TabsState): TabState | undefined => {
    if (!state.tabs || !state.activeTabId) {
        return;
    }
    return state.tabs.find((tab) => tab.identifier === state.activeTabId);
};

// Re-export for convenience
export type { DateFilterConfigState, FilterContextState, LayoutState };

/**
 * @alpha
 */
export interface TabState {
    title?: string;
    identifier: string;

    dateFilterConfig?: DateFilterConfigState;
    dateFilterConfigs?: DateFilterConfigsState;
    attributeFilterConfigs?: AttributeFilterConfigsState;
    filterContext?: FilterContextState;
    layout?: LayoutState;
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
     * Identifier of the currently active tab.
     */
    activeTabId?: string;
    /**
     * Attribute metadata objects with referenced objects for all attribute filters across all tabs.
     * @beta
     */
    attributesWithReferences?: IAttributeWithReferences[];
}

export const tabsInitialState: TabsState = {
    tabs: undefined,
    activeTabId: undefined,
    attributesWithReferences: undefined,
};
