// (C) 2021-2022 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
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
