// (C) 2021-2025 GoodData Corporation

import { createSlice, Reducer } from "@reduxjs/toolkit";
import { listedDashboardsEntityAdapter } from "./listedDashboardsEntityAdapter.js";

export type ListedDashboardsState = ReturnType<typeof listedDashboardsEntityAdapter.getInitialState>;

const listedDashboardsSlice = createSlice({
    name: "listedDashboards",
    initialState: listedDashboardsEntityAdapter.getInitialState(),
    reducers: {
        setListedDashboards: listedDashboardsEntityAdapter.setAll,
        addListedDashboard: listedDashboardsEntityAdapter.upsertOne,
    },
});

export const listedDashboardsSliceReducer: Reducer<ListedDashboardsState> = listedDashboardsSlice.reducer;

// Spread "fixes" TS2742 error
export const listedDashboardsActions = { ...listedDashboardsSlice.actions };
