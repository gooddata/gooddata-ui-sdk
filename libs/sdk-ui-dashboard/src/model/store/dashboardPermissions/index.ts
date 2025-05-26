// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { dashboardPermissionsReducers } from "./dashboardPermissionsReducers.js";
import { dashboardPermissionsInitialState } from "./dashboardPermissionsState.js";

const dashboardPermissionsSlice = createSlice({
    name: "dashboardPermissions",
    initialState: dashboardPermissionsInitialState,
    reducers: dashboardPermissionsReducers,
});

export const dashboardPermissionsSliceReducer = dashboardPermissionsSlice.reducer;
export const dashboardPermissionsActions = dashboardPermissionsSlice.actions;
