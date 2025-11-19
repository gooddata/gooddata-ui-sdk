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
    if (!state.tabs || !state.activeTabLocalIdentifier) {
        return;
    }
    return state.tabs.find((tab) => tab.localIdentifier === state.activeTabLocalIdentifier);
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
