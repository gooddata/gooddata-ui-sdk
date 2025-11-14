// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { isEmpty } from "lodash-es";

import {
    DashboardDateFilterConfigMode,
    IDashboardDateFilterConfig,
    IDateFilterConfig,
} from "@gooddata/sdk-model";

import { DateFilterValidationResult } from "../../../../types.js";
import { DateFilterConfigState, TabsState, getActiveTab } from "../tabsState.js";

type DateFilterConfigReducer<A extends Action> = CaseReducer<TabsState, A>;

type SetDateFilterConfigPayload = {
    /**
     * Contains current dashboard's overrides of the date filter config.
     *
     * This may be undefined as the dashboard may not contain any overrides.
     */
    dateFilterConfig?: IDashboardDateFilterConfig;

    /**
     * Contains effective date filter config that is a result of merging workspace-level config with the
     * dashboard-level overrides.
     */
    effectiveDateFilterConfig: IDateFilterConfig;

    /**
     * Indicates whether the effective date filter config is using the dashboard overrides.
     */
    isUsingDashboardOverrides: boolean;
};

const emptyDateFilterConfig: DateFilterConfigState = {
    dateFilterConfig: undefined,
    effectiveDateFilterConfig: undefined,
    isUsingDashboardOverrides: undefined,
    dateFilterConfigValidationWarnings: undefined,
};

const setDateFilterConfig: DateFilterConfigReducer<PayloadAction<SetDateFilterConfigPayload>> = (
    state,
    action,
) => {
    const { dateFilterConfig, effectiveDateFilterConfig, isUsingDashboardOverrides } = action.payload;

    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }

    // Initialize dateFilterConfig if it doesn't exist
    if (!activeTab.dateFilterConfig) {
        activeTab.dateFilterConfig = {
            ...emptyDateFilterConfig,
        };
    }

    // Update the active tab's date filter config state
    activeTab.dateFilterConfig.dateFilterConfig = dateFilterConfig;
    activeTab.dateFilterConfig.effectiveDateFilterConfig = effectiveDateFilterConfig;
    activeTab.dateFilterConfig.isUsingDashboardOverrides = isUsingDashboardOverrides;
};

const setDateFilterConfigMode: DateFilterConfigReducer<PayloadAction<DashboardDateFilterConfigMode>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.dateFilterConfig) {
        activeTab.dateFilterConfig = {
            ...emptyDateFilterConfig,
        };
    }

    const mode = action.payload;
    const currentConfig = activeTab.dateFilterConfig.dateFilterConfig;
    const newDateFilterConfig = isEmpty(currentConfig)
        ? {
              mode,
              filterName: "", // will fallback to default name
          }
        : {
              ...currentConfig,
              mode,
          };

    activeTab.dateFilterConfig.dateFilterConfig = newDateFilterConfig;
};

const setDateFilterConfigTitle: DateFilterConfigReducer<PayloadAction<string | undefined>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.dateFilterConfig) {
        activeTab.dateFilterConfig = {
            ...emptyDateFilterConfig,
        };
    }

    const title = action.payload ?? "";
    const currentConfig = activeTab.dateFilterConfig.dateFilterConfig;
    const newDateFilterConfig: IDashboardDateFilterConfig = isEmpty(currentConfig)
        ? {
              mode: "active",
              filterName: title,
          }
        : {
              ...currentConfig,
              filterName: title,
          };

    activeTab.dateFilterConfig.dateFilterConfig = newDateFilterConfig;
};

const addDateFilterConfigValidationWarning: DateFilterConfigReducer<
    PayloadAction<DateFilterValidationResult>
> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.dateFilterConfig) {
        activeTab.dateFilterConfig = {
            ...emptyDateFilterConfig,
        };
    }

    if (!activeTab.dateFilterConfig.dateFilterConfigValidationWarnings) {
        activeTab.dateFilterConfig.dateFilterConfigValidationWarnings = [];
    }

    activeTab.dateFilterConfig.dateFilterConfigValidationWarnings.push(action.payload);
};

const clearDateFilterConfigValidationWarning: DateFilterConfigReducer<PayloadAction> = (state) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (activeTab.dateFilterConfig) {
        activeTab.dateFilterConfig.dateFilterConfigValidationWarnings = [];
    }
};

const updateDateFilterConfig: DateFilterConfigReducer<PayloadAction<IDashboardDateFilterConfig>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.dateFilterConfig) {
        activeTab.dateFilterConfig = {
            ...emptyDateFilterConfig,
        };
    }

    activeTab.dateFilterConfig.dateFilterConfig = action.payload;
};

export const dateFilterConfigReducers = {
    setDateFilterConfig,
    setDateFilterConfigMode,
    setDateFilterConfigTitle,
    updateDateFilterConfig,
    addDateFilterConfigValidationWarning,
    clearDateFilterConfigValidationWarning,
};
