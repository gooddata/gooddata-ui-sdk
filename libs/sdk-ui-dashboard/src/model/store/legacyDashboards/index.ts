// (C) 2021-2022 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { legacyDashboardsReducers } from "./legacyDashboardsReducers.js";
import { legacyDashboardsInitialState } from "./legacyDashboardsState.js";

const legacyDashboardsSlice = createSlice({
    name: "legacyDashboards",
    initialState: legacyDashboardsInitialState,
    reducers: legacyDashboardsReducers,
});

export const legacyDashboardsSliceReducer = legacyDashboardsSlice.reducer;
export const legacyDashboardsActions = legacyDashboardsSlice.actions;
