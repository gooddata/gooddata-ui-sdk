// (C) 2023-2025 GoodData Corporation

import { createSlice, Reducer } from "@reduxjs/toolkit";
import { inaccessibleDashboardsEntityAdapter } from "./inaccessibleDashboardsEntityAdapter.js";

export type InaccessibleDashboardsState = ReturnType<
    typeof inaccessibleDashboardsEntityAdapter.getInitialState
>;
const inaccessibleDashboardsSlice = createSlice({
    name: "inaccessibleDashboards",
    initialState: inaccessibleDashboardsEntityAdapter.getInitialState(),
    reducers: {
        addInaccessibleDashboards: inaccessibleDashboardsEntityAdapter.upsertMany,
    },
});

export const inaccessibleDashboardsSliceReducer: Reducer<InaccessibleDashboardsState> =
    inaccessibleDashboardsSlice.reducer;

// Spread "fixes" TS2742 error
export const inaccessibleDashboardsActions = { ...inaccessibleDashboardsSlice.actions };
