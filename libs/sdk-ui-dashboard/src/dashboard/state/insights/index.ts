// (C) 2021 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { insightsAdapter } from "./insightsEntityAdapter";

const insightsSlice = createSlice({
    name: "insights",
    initialState: insightsAdapter.getInitialState(),
    reducers: {
        setInsights: insightsAdapter.setAll,
    },
});

export const insightsSliceReducer = insightsSlice.reducer;
export const insightsActions = insightsSlice.actions;
