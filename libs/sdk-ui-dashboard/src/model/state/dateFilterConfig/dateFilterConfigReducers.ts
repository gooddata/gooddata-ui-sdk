// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DateFilterConfigState } from "./dateFilterConfigState";
import { IDashboardDateFilterConfig, IDateFilterConfig } from "@gooddata/sdk-backend-spi";

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

export const dateFilterConfigReducers = {
    setDateFilterConfig,
};
