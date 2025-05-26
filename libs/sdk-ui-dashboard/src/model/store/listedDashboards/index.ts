// (C) 2021-2025 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
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
