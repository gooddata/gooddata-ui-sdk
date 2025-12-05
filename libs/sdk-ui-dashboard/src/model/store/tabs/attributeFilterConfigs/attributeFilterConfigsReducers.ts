// (C) 2023-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import {
    SetDashboardAttributeFilterConfigDisplayAsLabelPayload,
    SetDashboardAttributeFilterConfigModePayload,
} from "../../../../model/commands/dashboard.js";
import { TabsReducer } from "../tabsReducers.js";
import { TabsState, getActiveTab, getTabOrActive } from "../tabsState.js";

type AttributeFilterConfigReducer<A extends Action> = CaseReducer<TabsState, A>;

/**
 * Changes the config mode for the attribute filter given by its local identifier.
 */
const changeAttributeFilterConfigMode: AttributeFilterConfigReducer<
    PayloadAction<SetDashboardAttributeFilterConfigModePayload>
> = (state, action) => {
    const { localIdentifier } = action.payload;

    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.attributeFilterConfigs) {
        activeTab.attributeFilterConfigs = { attributeFilterConfigs: [] };
    }
    const existingConfig = activeTab.attributeFilterConfigs.attributeFilterConfigs?.find(
        (item) => item.localIdentifier === localIdentifier,
    );

    if (existingConfig) {
        existingConfig.mode = action.payload.mode;
        activeTab.attributeFilterConfigs.attributeFilterConfigs = [
            ...(activeTab.attributeFilterConfigs.attributeFilterConfigs ?? []),
        ];
    } else {
        activeTab.attributeFilterConfigs.attributeFilterConfigs = [
            ...(activeTab.attributeFilterConfigs.attributeFilterConfigs || []),
            action.payload,
        ];
    }
};

/**
 * Changes the config mode for the filter given by its local identifier.
 */
const changeDisplayAsLabel: AttributeFilterConfigReducer<
    PayloadAction<SetDashboardAttributeFilterConfigDisplayAsLabelPayload>
> = (state, action) => {
    const { localIdentifier, displayAsLabel, tabLocalIdentifier } = action.payload;

    const targetTab = getTabOrActive(state, tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    if (!targetTab.attributeFilterConfigs) {
        targetTab.attributeFilterConfigs = { attributeFilterConfigs: [] };
    }
    const existingConfig = targetTab.attributeFilterConfigs.attributeFilterConfigs?.find(
        (item) => item.localIdentifier === localIdentifier,
    );

    if (existingConfig) {
        existingConfig.displayAsLabel = displayAsLabel;
        targetTab.attributeFilterConfigs.attributeFilterConfigs = [
            ...(targetTab.attributeFilterConfigs.attributeFilterConfigs ?? []),
        ];
    } else {
        targetTab.attributeFilterConfigs.attributeFilterConfigs = [
            ...(targetTab.attributeFilterConfigs.attributeFilterConfigs || []),
            action.payload,
        ];
    }
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

const removeAttributeFilterConfig: TabsReducer<PayloadAction<string>> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (activeTab.attributeFilterConfigs?.attributeFilterConfigs) {
        activeTab.attributeFilterConfigs.attributeFilterConfigs =
            activeTab.attributeFilterConfigs.attributeFilterConfigs.filter(
                (attributeFilterConfig) => attributeFilterConfig.localIdentifier !== action.payload,
            );
    }
};

export const attributeFilterConfigsReducers = {
    changeAttributeFilterConfigMode,
    setAttributeFilterConfigs,
    removeAttributeFilterConfig,
    changeDisplayAsLabel,
};
