// (C) 2021 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { accessibleDashboardsEntityAdapter } from "./accessibleDashboardsEntityAdapter";

const accessibleDashboardsSlice = createSlice({
    name: "accessibleDashboards",
    initialState: accessibleDashboardsEntityAdapter.getInitialState(),
    reducers: {
        setAccessibleDashboards: accessibleDashboardsEntityAdapter.setAll,
    },
});

export const accessibleDashboardsSliceReducer = accessibleDashboardsSlice.reducer;
export const accessibleDashboardsActions = accessibleDashboardsSlice.actions;
