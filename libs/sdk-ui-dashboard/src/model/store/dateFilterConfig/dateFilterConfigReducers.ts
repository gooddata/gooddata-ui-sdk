// (C) 2021-2022 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DateFilterConfigState } from "./dateFilterConfigState.js";
import { IDateFilterConfig, IDashboardDateFilterConfig } from "@gooddata/sdk-model";
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
    addDateFilterConfigValidationWarning,
    clearDateFilterConfigValidationWarning,
};
