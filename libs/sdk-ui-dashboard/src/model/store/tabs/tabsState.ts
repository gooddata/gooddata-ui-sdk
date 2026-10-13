// (C) 2025-2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import type { IDashboardFilterGroupsConfig } from "@gooddata/sdk-model";

import { type IAttributeFilterConfigsState } from "./attributeFilterConfigs/attrtibuteFilterConfigsState.js";
import type { IDateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState.js";
import { type IDateFilterConfigsState } from "./dateFilterConfigs/dateFilterConfigsState.js";
import type { FilterContextState } from "./filterContext/filterContextState.js";
import type { ILayoutState } from "./layout/layoutState.js";
import { type IMeasureValueFilterConfigsState } from "./measureValueFilterConfigs/measureValueFilterConfigsState.js";
import { type IParametersState } from "./parameters/parametersState.js";

/**
 * Identifier used for dashboards without explicit tabs support and the first tab created automatically.
 *
 * @internal
 */
export const DEFAULT_TAB_ID = "defaultTabId";

export const getActiveTab = (state: ITabsState): ITabState | undefined => {
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
export const getTabOrActive = (state: ITabsState, tabLocalIdentifier?: string): ITabState | undefined => {
    if (!state.tabs) {
        return;
    }
    if (tabLocalIdentifier) {
        return state.tabs.find((tab) => tab.localIdentifier === tabLocalIdentifier);
    }
    return getActiveTab(state);
};

/**
 * Tabs a filter or parameter mutation should write.
 *
 * With `persistFiltersAcrossTabs` off, that is the tab addressed by `tabLocalIdentifier`
 * or the active tab. With the flag on, that is every tab, source first. Working-selection
 * edits stay on the source tab so half-applied values are not mirrored.
 *
 * @internal
 */
export const getTabsToMutate = (
    state: ITabsState,
    tabLocalIdentifier?: string,
    enablePersistentFiltersAcrossTabs?: boolean,
    isWorkingSelectionChange?: boolean,
): ITabState[] => {
    const source = getTabOrActive(state, tabLocalIdentifier);
    if (!source) {
        return [];
    }
    if (isWorkingSelectionChange || !enablePersistentFiltersAcrossTabs) {
        return [source];
    }
    const others = (state.tabs ?? []).filter((tab) => tab.localIdentifier !== source.localIdentifier);
    return [source, ...others];
};

/**
 * @alpha
 */
export interface ITabState {
    title?: string;
    localIdentifier: string;

    dateFilterConfig?: IDateFilterConfigState;
    dateFilterConfigs?: IDateFilterConfigsState;
    attributeFilterConfigs?: IAttributeFilterConfigsState;
    measureValueFilterConfigs?: IMeasureValueFilterConfigsState;
    filterContext?: FilterContextState;
    filterGroupsConfig?: IDashboardFilterGroupsConfig;
    layout?: ILayoutState;
    parameters?: IParametersState;

    /**
     * UI-only flag indicating the tab is currently being renamed.
     * @internal
     */
    isRenaming?: boolean;
}

/**
 * @alpha
 */
export interface ITabsState {
    /**
     * Array of tabs with their configurations.
     */
    tabs?: ITabState[];
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

export const tabsInitialState: ITabsState = {
    tabs: undefined,
    activeTabLocalIdentifier: undefined,
    attributesWithReferences: undefined,
};
