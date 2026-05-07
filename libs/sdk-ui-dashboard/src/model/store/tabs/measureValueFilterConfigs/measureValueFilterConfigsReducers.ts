// (C) 2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import {
    type DashboardAttributeFilterConfigMode,
    type IDashboardMeasureValueFilterConfig,
} from "@gooddata/sdk-model";

import { type ITabsState, getActiveTab } from "../tabsState.js";

type MeasureValueFilterConfigReducer<A extends Action> = CaseReducer<ITabsState, A>;

/**
 * @internal
 */
export interface IChangeMeasureValueFilterConfigModePayload {
    localIdentifier: string;
    mode?: DashboardAttributeFilterConfigMode;
}

/**
 * @internal
 */
export interface ISetMeasureValueFilterConfigsPayload {
    measureValueFilterConfigs?: IDashboardMeasureValueFilterConfig[];
}

/**
 * Changes the config mode for the measure value filter given by its local identifier.
 */
const changeMeasureValueFilterConfigMode: MeasureValueFilterConfigReducer<
    PayloadAction<IChangeMeasureValueFilterConfigModePayload>
> = (state, action) => {
    const { localIdentifier, mode } = action.payload;

    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.measureValueFilterConfigs) {
        activeTab.measureValueFilterConfigs = { measureValueFilterConfigs: [] };
    }
    const existingConfig = activeTab.measureValueFilterConfigs.measureValueFilterConfigs?.find(
        (item) => item.localIdentifier === localIdentifier,
    );

    if (existingConfig) {
        existingConfig.mode = mode;
        activeTab.measureValueFilterConfigs.measureValueFilterConfigs = [
            ...(activeTab.measureValueFilterConfigs.measureValueFilterConfigs ?? []),
        ];
    } else {
        activeTab.measureValueFilterConfigs.measureValueFilterConfigs = [
            ...(activeTab.measureValueFilterConfigs.measureValueFilterConfigs || []),
            { localIdentifier, mode },
        ];
    }
};

const setMeasureValueFilterConfigs: MeasureValueFilterConfigReducer<
    PayloadAction<ISetMeasureValueFilterConfigsPayload>
> = (state, action) => {
    const { measureValueFilterConfigs } = action.payload;

    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    activeTab.measureValueFilterConfigs = measureValueFilterConfigs
        ? { measureValueFilterConfigs }
        : undefined;
};

const removeMeasureValueFilterConfig: MeasureValueFilterConfigReducer<PayloadAction<string>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (activeTab.measureValueFilterConfigs?.measureValueFilterConfigs) {
        activeTab.measureValueFilterConfigs.measureValueFilterConfigs =
            activeTab.measureValueFilterConfigs.measureValueFilterConfigs.filter(
                (config) => config.localIdentifier !== action.payload,
            );
    }
};

export const measureValueFilterConfigsReducers = {
    changeMeasureValueFilterConfigMode,
    setMeasureValueFilterConfigs,
    removeMeasureValueFilterConfig,
};
