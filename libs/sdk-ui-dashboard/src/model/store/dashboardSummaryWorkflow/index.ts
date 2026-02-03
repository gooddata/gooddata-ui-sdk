// (C) 2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { dashboardSummaryWorkflowReducers } from "./dashboardSummaryWorkflowReducers.js";
import {
    type DashboardSummaryWorkflowState,
    dashboardSummaryWorkflowInitialState,
} from "./dashboardSummaryWorkflowState.js";

const dashboardSummaryWorkflowSlice = createSlice({
    name: "dashboardSummaryWorkflowSlice",
    initialState: dashboardSummaryWorkflowInitialState,
    reducers: dashboardSummaryWorkflowReducers,
});

export const dashboardSummaryWorkflowSliceReducer: Reducer<DashboardSummaryWorkflowState> =
    dashboardSummaryWorkflowSlice.reducer;

export const dashboardSummaryWorkflowActions = dashboardSummaryWorkflowSlice.actions;
