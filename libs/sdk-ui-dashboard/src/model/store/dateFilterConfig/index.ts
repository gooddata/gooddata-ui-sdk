// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { dateFilterConfigReducers } from "./dateFilterConfigReducers.js";
import { DateFilterConfigState, dateFilterConfigInitialState } from "./dateFilterConfigState.js";

const configSlice = createSlice({
    name: "dateFilterConfig",
    initialState: dateFilterConfigInitialState,
    reducers: dateFilterConfigReducers,
});

export const dateFilterConfigSliceReducer: Reducer<DateFilterConfigState> = configSlice.reducer;

// Spread "fixes" TS2742 error
export const dateFilterConfigActions = { ...configSlice.actions };
