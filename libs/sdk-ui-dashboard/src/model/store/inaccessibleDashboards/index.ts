// (C) 2023-2025 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { inaccessibleDashboardsEntityAdapter } from "./inaccessibleDashboardsEntityAdapter.js";

const inaccessibleDashboardsSlice = createSlice({
    name: "inaccessibleDashboards",
    initialState: inaccessibleDashboardsEntityAdapter.getInitialState(),
    reducers: {
        addInaccessibleDashboards: inaccessibleDashboardsEntityAdapter.upsertMany,
    },
});

export const inaccessibleDashboardsSliceReducer = inaccessibleDashboardsSlice.reducer;
export const inaccessibleDashboardsActions = inaccessibleDashboardsSlice.actions;
