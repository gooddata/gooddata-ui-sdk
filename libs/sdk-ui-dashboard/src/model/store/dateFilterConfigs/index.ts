// (C) 2023-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { dateFilterConfigsInitialState, DateFilterConfigsState } from "./dateFilterConfigsState.js";
import { dateFilterConfigsReducers } from "./dateFilterConfigsReducers.js";

const configSlice = createSlice({
    name: "dateFilterConfigs",
    initialState: dateFilterConfigsInitialState,
    reducers: dateFilterConfigsReducers,
});

export const dateFilterConfigsSliceReducer: Reducer<DateFilterConfigsState> = configSlice.reducer;

// Spread "fixes" TS2742 error
export const dateFilterConfigsActions = { ...configSlice.actions };
