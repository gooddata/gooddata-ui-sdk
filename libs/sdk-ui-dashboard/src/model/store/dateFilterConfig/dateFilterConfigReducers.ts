// (C) 2021-2022 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DateFilterConfigState } from "./dateFilterConfigState.js";
import {
    IDateFilterConfig,
    IDashboardDateFilterConfig,
    DashboardDateFilterConfigMode,
} from "@gooddata/sdk-model";
import { DateFilterValidationResult } from "../../../types.js";

const DEFAULT_DASHBOARD_DATE_FILTER_NAME = "Date range";

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
              filterName: DEFAULT_DASHBOARD_DATE_FILTER_NAME,
          }
        : {
              ...state.dateFilterConfig,
              mode,
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

export const dateFilterConfigReducers = {
    setDateFilterConfig,
    setDateFilterConfigMode,
    addDateFilterConfigValidationWarning,
    clearDateFilterConfigValidationWarning,
};
