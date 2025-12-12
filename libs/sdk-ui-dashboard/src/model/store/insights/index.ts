// (C) 2021-2025 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { insightsAdapter } from "./insightsEntityAdapter.js";

export type InsightsState = ReturnType<typeof insightsAdapter.getInitialState>;

const insightsSlice = createSlice({
    name: "insights",
    initialState: insightsAdapter.getInitialState(),
    reducers: {
        setInsights: insightsAdapter.setAll,
        addInsights: insightsAdapter.addMany,
        upsertInsight: insightsAdapter.upsertOne,
    },
});

export const insightsSliceReducer: Reducer<InsightsState> = insightsSlice.reducer;

// Spread "fixes" TS2742 error
export const insightsActions = { ...insightsSlice.actions };
