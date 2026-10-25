// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { resetInsightUsageOnDashboards, updateInsightUsageOnDashboards } from "../../actions/data_actions.js";
import { isApplicationResetEvent } from "../app_context/application_reset_events.js";

import { type IInsightUsageState, insightUsageInitialState } from "./insight_usage_state.js";

const insightUsageSlice = createSlice({
    name: "insightUsage",
    initialState: insightUsageInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateInsightUsageOnDashboards, (_state, action): IInsightUsageState => ({
                referencedDashboards: action.payload.usages,
                allUserDashboards: action.payload.dashboards,
            }))
            // null rather than an absent key; every reader treats the two the same
            .addCase(resetInsightUsageOnDashboards, (): IInsightUsageState => insightUsageInitialState)
            // the application resets (store/app_context/application_reset_events.ts)
            .addMatcher(isApplicationResetEvent, (): IInsightUsageState => insightUsageInitialState);
    },
});

export const insightUsageSliceReducer: Reducer<IInsightUsageState> = insightUsageSlice.reducer;
