// (C) 2021 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { listedDashboardsEntityAdapter } from "./listedDashboardsEntityAdapter";

const listedDashboardsSlice = createSlice({
    name: "listedDashboards",
    initialState: listedDashboardsEntityAdapter.getInitialState(),
    reducers: {
        setListedDashboards: listedDashboardsEntityAdapter.setAll,
    },
});

export const listedDashboardsSliceReducer = listedDashboardsSlice.reducer;
export const listedDashboardsActions = listedDashboardsSlice.actions;
