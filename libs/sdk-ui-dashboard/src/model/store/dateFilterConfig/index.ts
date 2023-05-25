// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { dateFilterConfigReducers } from "./dateFilterConfigReducers.js";
import { dateFilterConfigInitialState } from "./dateFilterConfigState.js";

const configSlice = createSlice({
    name: "dateFilterConfig",
    initialState: dateFilterConfigInitialState,
    reducers: dateFilterConfigReducers,
});

export const dateFilterConfigSliceReducer = configSlice.reducer;
export const dateFilterConfigActions = configSlice.actions;
