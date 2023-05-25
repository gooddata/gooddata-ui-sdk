// (C) 2021-2023 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { dashboardPermissionsReducers } from "./dashboardPermissionsReducers.js";
import { dashboardPermissionsInitialState } from "./dashboardPermissionsState.js";

const dashboardPermissionsSlice = createSlice({
    name: "dashboardPermissions",
    initialState: dashboardPermissionsInitialState,
    reducers: dashboardPermissionsReducers,
});

export const dashboardPermissionsSliceReducer = dashboardPermissionsSlice.reducer;
export const dashboardPermissionsActions = dashboardPermissionsSlice.actions;
