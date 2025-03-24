// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { dateFilterConfigReducers } from "./dateFilterConfigReducers.js";
import { dateFilterConfigInitialState, DateFilterConfigState } from "./dateFilterConfigState.js";

const configSlice = createSlice({
    name: "dateFilterConfig",
    initialState: dateFilterConfigInitialState,
    reducers: dateFilterConfigReducers,
});

export const dateFilterConfigSliceReducer: Reducer<DateFilterConfigState> = configSlice.reducer;

// Spread "fixes" TS2742 error
export const dateFilterConfigActions = { ...configSlice.actions };
