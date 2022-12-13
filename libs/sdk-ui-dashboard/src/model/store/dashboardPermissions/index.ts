// (C) 2021-2022 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { dashboardPermissionsReducers } from "./dashboardPermissionsReducers";
import { dashboardPermissionsInitialState } from "./dashboardPermissionsState";

const dashboardPermissionsSlice = createSlice({
    name: "dashboardPermissions",
    initialState: dashboardPermissionsInitialState,
    reducers: dashboardPermissionsReducers,
});

export const dashboardPermissionsSliceReducer = dashboardPermissionsSlice.reducer;
export const dashboardPermissionsActions = dashboardPermissionsSlice.actions;
