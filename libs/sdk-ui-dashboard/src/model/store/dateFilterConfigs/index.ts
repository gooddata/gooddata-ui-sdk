// (C) 2023-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { dateFilterConfigsReducers } from "./dateFilterConfigsReducers.js";
import { DateFilterConfigsState, dateFilterConfigsInitialState } from "./dateFilterConfigsState.js";

const configSlice = createSlice({
    name: "dateFilterConfigs",
    initialState: dateFilterConfigsInitialState,
    reducers: dateFilterConfigsReducers,
});

export const dateFilterConfigsSliceReducer: Reducer<DateFilterConfigsState> = configSlice.reducer;

// Spread "fixes" TS2742 error
export const dateFilterConfigsActions = { ...configSlice.actions };
