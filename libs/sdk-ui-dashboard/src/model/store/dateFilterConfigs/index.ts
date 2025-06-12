// (C) 2023-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { dateFilterConfigsInitialState } from "./dateFilterConfigsState.js";
import { dateFilterConfigsReducers } from "./dateFilterConfigsReducers.js";

const configSlice = createSlice({
    name: "dateFilterConfigs",
    initialState: dateFilterConfigsInitialState,
    reducers: dateFilterConfigsReducers,
});

export const dateFilterConfigsSliceReducer = configSlice.reducer;
export const dateFilterConfigsActions = configSlice.actions;
