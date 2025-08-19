// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { configReducers } from "./configReducers.js";
import { ConfigState, configInitialState } from "./configState.js";

const configSlice = createSlice({
    name: "config",
    initialState: configInitialState,
    reducers: configReducers,
});

export const configSliceReducer: Reducer<ConfigState> = configSlice.reducer;

// Spread "fixes" TS2742 error
export const configActions = { ...configSlice.actions };
