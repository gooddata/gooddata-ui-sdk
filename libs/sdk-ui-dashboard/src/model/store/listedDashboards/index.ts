// (C) 2021-2022 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { listedDashboardsEntityAdapter } from "./listedDashboardsEntityAdapter.js";

const listedDashboardsSlice = createSlice({
    name: "listedDashboards",
    initialState: listedDashboardsEntityAdapter.getInitialState(),
    reducers: {
        setListedDashboards: listedDashboardsEntityAdapter.setAll,
        addListedDashboard: listedDashboardsEntityAdapter.upsertOne,
    },
});

export const listedDashboardsSliceReducer = listedDashboardsSlice.reducer;
export const listedDashboardsActions = listedDashboardsSlice.actions;
