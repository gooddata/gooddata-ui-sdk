// (C) 2023-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { attributeFilterConfigsReducers } from "./attributeFilterConfigsReducers.js";
import {
    AttributeFilterConfigsState,
    attributeFilterConfigsInitialState,
} from "./attributeFilterConfigsState.js";

const configSlice = createSlice({
    name: "attributeFilterConfigs",
    initialState: attributeFilterConfigsInitialState,
    reducers: attributeFilterConfigsReducers,
});

export const attributeFilterConfigsSliceReducer: Reducer<AttributeFilterConfigsState> = configSlice.reducer;

// Spread "fixes" TS2742 error
export const attributeFilterConfigsActions = { ...configSlice.actions };
