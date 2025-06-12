// (C) 2021-2024 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DateFilterConfigState } from "./dateFilterConfigState.js";
import {
    IDateFilterConfig,
    IDashboardDateFilterConfig,
    DashboardDateFilterConfigMode,
} from "@gooddata/sdk-model";
import { DateFilterValidationResult } from "../../../types.js";

type DateFilterConfigReducer<A extends Action> = CaseReducer<DateFilterConfigState, A>;

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

const setDateFilterConfig: DateFilterConfigReducer<PayloadAction<SetDateFilterConfigPayload>> = (
    state,
    action,
) => {
    const { dateFilterConfig, effectiveDateFilterConfig, isUsingDashboardOverrides } = action.payload;

    state.dateFilterConfig = dateFilterConfig;
    state.effectiveDateFilterConfig = effectiveDateFilterConfig;
    state.isUsingDashboardOverrides = isUsingDashboardOverrides;
};

const setDateFilterConfigMode: DateFilterConfigReducer<PayloadAction<DashboardDateFilterConfigMode>> = (
    state,
    action,
) => {
    const mode = action.payload;
    const newDateFilterConfig = isEmpty(state.dateFilterConfig)
        ? {
              mode,
              filterName: "", // will fallback to default name
          }
        : {
              ...state.dateFilterConfig,
              mode,
          };

    state.dateFilterConfig = newDateFilterConfig;
};

const setDateFilterConfigTitle: DateFilterConfigReducer<PayloadAction<string | undefined>> = (
    state,
    action,
) => {
    const title = action.payload ?? "";
    const newDateFilterConfig: IDashboardDateFilterConfig = isEmpty(state.dateFilterConfig)
        ? {
              mode: "active",
              filterName: title,
          }
        : {
              ...state.dateFilterConfig,
              filterName: title,
          };

    state.dateFilterConfig = newDateFilterConfig;
};

const addDateFilterConfigValidationWarning: DateFilterConfigReducer<
    PayloadAction<DateFilterValidationResult>
> = (state, action) => {
    if (!state.dateFilterConfigValidationWarnings) {
        state.dateFilterConfigValidationWarnings = [];
    }
    state.dateFilterConfigValidationWarnings.push(action.payload);
};

const clearDateFilterConfigValidationWarning: DateFilterConfigReducer<PayloadAction> = (state) => {
    state.dateFilterConfigValidationWarnings = [];
};

const updateDateFilterConfig: DateFilterConfigReducer<PayloadAction<IDashboardDateFilterConfig>> = (
    state,
    action,
) => {
    state.dateFilterConfig = action.payload;
};

export const dateFilterConfigReducers = {
    setDateFilterConfig,
    setDateFilterConfigMode,
    setDateFilterConfigTitle,
    updateDateFilterConfig,
    addDateFilterConfigValidationWarning,
    clearDateFilterConfigValidationWarning,
};
