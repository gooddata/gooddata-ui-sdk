// (C) 2021-2025 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { insightsAdapter } from "./insightsEntityAdapter.js";

const insightsSlice = createSlice({
    name: "insights",
    initialState: insightsAdapter.getInitialState(),
    reducers: {
        setInsights: insightsAdapter.setAll,
        addInsights: insightsAdapter.addMany,
        upsertInsight: insightsAdapter.upsertOne,
    },
});

export const insightsSliceReducer = insightsSlice.reducer;
export const insightsActions = insightsSlice.actions;
