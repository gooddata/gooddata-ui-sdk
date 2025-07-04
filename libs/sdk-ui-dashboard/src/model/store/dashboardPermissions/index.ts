// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { dashboardPermissionsReducers } from "./dashboardPermissionsReducers.js";
import { dashboardPermissionsInitialState, DashboardPermissionsState } from "./dashboardPermissionsState.js";

const dashboardPermissionsSlice = createSlice({
    name: "dashboardPermissions",
    initialState: dashboardPermissionsInitialState,
    reducers: dashboardPermissionsReducers,
});

export const dashboardPermissionsSliceReducer: Reducer<DashboardPermissionsState> =
    dashboardPermissionsSlice.reducer;

// Spread "fixes" TS2742 error
export const dashboardPermissionsActions = { ...dashboardPermissionsSlice.actions };
