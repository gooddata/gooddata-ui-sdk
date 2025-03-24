// (C) 2023-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import {
    attributeFilterConfigsInitialState,
    AttributeFilterConfigsState,
} from "./attributeFilterConfigsState.js";
import { attributeFilterConfigsReducers } from "./attributeFilterConfigsReducers.js";

const configSlice = createSlice({
    name: "attributeFilterConfigs",
    initialState: attributeFilterConfigsInitialState,
    reducers: attributeFilterConfigsReducers,
});

export const attributeFilterConfigsSliceReducer: Reducer<AttributeFilterConfigsState> = configSlice.reducer;

// Spread "fixes" TS2742 error
export const attributeFilterConfigsActions = { ...configSlice.actions };
