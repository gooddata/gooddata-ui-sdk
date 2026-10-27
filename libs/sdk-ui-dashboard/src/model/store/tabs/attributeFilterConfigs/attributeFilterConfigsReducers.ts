// (C) 2023-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import {
    type DashboardAttributeFilterConfigMode,
    type DashboardAttributeFilterSelectionType,
    type IDashboardAttributeFilterConfig,
    type ObjRef,
} from "@gooddata/sdk-model";

import { type TabsReducer } from "../tabsReducers.js";
import { type ITabState, type ITabsState, getActiveTab, getTabOrActive } from "../tabsState.js";

type AttributeFilterConfigReducer<A extends Action> = CaseReducer<ITabsState, A>;

/**
 * @internal
 */
export interface IChangeAttributeFilterConfigModePayload {
    /**
     * Local identifier of the filter to change mode.
     */
    localIdentifier: string;
    /**
     * Mode of the attribute filter.
     */
    mode?: DashboardAttributeFilterConfigMode;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    tabLocalIdentifier?: string;
}

/**
 * @internal
 */
export interface IChangeAttributeFilterSelectionTypePayload {
    /**
     * Local identifier of the filter to change available mode.
     */
    localIdentifier: string;
    /**
     * Available mode of the attribute filter — controls which presentation modes
     * (list, text, or both) are available to the user in Dashboard View mode.
     */
    selectionType?: DashboardAttributeFilterSelectionType;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    tabLocalIdentifier?: string;
}

/**
 * @internal
 */
export interface IChangeAttributeFilterDisplayAsLabelPayload {
    /**
     * Local identifier of the filter to change display as label (= display form).
     */
    localIdentifier: string;
    /**
     *  Display as label of the attribute filter. Used to present filter in UI
     */
    displayAsLabel: ObjRef | undefined;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    tabLocalIdentifier?: string;
    /**
     * When true, tabs this change is synced to restore their own saved display as label instead of this payload.
     */
    restoreTargetOriginal?: boolean;
}

/**
 * @internal
 */
export interface IRemoveAttributeFilterConfigPayload {
    readonly localIdentifier: string;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * Changes the config mode for the attribute filter given by its local identifier.
 */
const changeAttributeFilterConfigMode: AttributeFilterConfigReducer<
    PayloadAction<IChangeAttributeFilterConfigModePayload>
> = (state, action) => {
    const { localIdentifier, mode, tabLocalIdentifier } = action.payload;
    const targetTab = getTabOrActive(state, tabLocalIdentifier);

    if (!targetTab) {
        return;
    }
    upsertAttributeFilterConfig(targetTab, localIdentifier, { mode });
};

/**
 * Changes the config mode for the filter given by its local identifier.
 */
const changeDisplayAsLabel: AttributeFilterConfigReducer<
    PayloadAction<IChangeAttributeFilterDisplayAsLabelPayload>
> = (state, action) => {
    const { localIdentifier, displayAsLabel, tabLocalIdentifier } = action.payload;

    const targetTab = getTabOrActive(state, tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    upsertAttributeFilterConfig(targetTab, localIdentifier, { displayAsLabel });
};

/**
 * Changes the available mode for the attribute filter given by its local identifier.
 */
const changeAttributeFilterSelectionType: AttributeFilterConfigReducer<
    PayloadAction<IChangeAttributeFilterSelectionTypePayload>
> = (state, action) => {
    const { localIdentifier, selectionType, tabLocalIdentifier } = action.payload;
    const targetTab = getTabOrActive(state, tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    upsertAttributeFilterConfig(targetTab, localIdentifier, { selectionType });
};

const setAttributeFilterConfigs: AttributeFilterConfigReducer<PayloadAction<any>> = (state, action) => {
    const { attributeFilterConfigs } = action.payload;

    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    activeTab.attributeFilterConfigs = attributeFilterConfigs
        ? {
              attributeFilterConfigs,
          }
        : undefined;
};

const removeAttributeFilterConfig: TabsReducer<PayloadAction<IRemoveAttributeFilterConfigPayload>> = (
    state,
    action,
) => {
    const { localIdentifier, tabLocalIdentifier } = action.payload;
    const configs = getTabOrActive(state, tabLocalIdentifier)?.attributeFilterConfigs;
    if (!configs?.attributeFilterConfigs) {
        return;
    }
    configs.attributeFilterConfigs = configs.attributeFilterConfigs.filter(
        (config) => config.localIdentifier !== localIdentifier,
    );
};

function upsertAttributeFilterConfig(
    tab: ITabState,
    localIdentifier: string,
    patch: Partial<Pick<IDashboardAttributeFilterConfig, "mode" | "displayAsLabel" | "selectionType">>,
): void {
    if (!tab.attributeFilterConfigs) {
        tab.attributeFilterConfigs = { attributeFilterConfigs: [] };
    }
    const configs = tab.attributeFilterConfigs.attributeFilterConfigs ?? [];
    // const existingConfig = configs.find((item) => item.localIdentifier === localIdentifier);

    const existingConfig = tab.attributeFilterConfigs.attributeFilterConfigs?.find(
        (item) => item.localIdentifier === localIdentifier,
    );
    if (existingConfig) {
        if ("mode" in patch) {
            existingConfig.mode = patch.mode;
        }
        if ("displayAsLabel" in patch) {
            existingConfig.displayAsLabel = patch.displayAsLabel;
        }
        if ("selectionType" in patch) {
            existingConfig.selectionType = patch.selectionType;
        }
        tab.attributeFilterConfigs.attributeFilterConfigs = [...configs];
        return;
    }

    tab.attributeFilterConfigs.attributeFilterConfigs = [...configs, { localIdentifier, ...patch }];
}

export const attributeFilterConfigsReducers = {
    changeAttributeFilterConfigMode,
    changeAttributeFilterSelectionType,
    setAttributeFilterConfigs,
    removeAttributeFilterConfig,
    changeDisplayAsLabel,
};
