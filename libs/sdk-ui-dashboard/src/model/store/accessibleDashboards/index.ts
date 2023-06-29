// (C) 2021-2022 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { accessibleDashboardsEntityAdapter } from "./accessibleDashboardsEntityAdapter.js";

const accessibleDashboardsSlice = createSlice({
    name: "accessibleDashboards",
    initialState: accessibleDashboardsEntityAdapter.getInitialState(),
    reducers: {
        setAccessibleDashboards: accessibleDashboardsEntityAdapter.setAll,
        addAccessibleDashboard: accessibleDashboardsEntityAdapter.upsertOne,
    },
});

export const accessibleDashboardsSliceReducer = accessibleDashboardsSlice.reducer;
export const accessibleDashboardsActions = accessibleDashboardsSlice.actions;
