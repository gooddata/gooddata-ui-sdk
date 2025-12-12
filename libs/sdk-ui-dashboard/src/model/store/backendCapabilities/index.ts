// (C) 2021-2025 GoodData Corporation
import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { backendCapabilitiesReducers } from "./backendCapabilitiesReducers.js";
import {
    type BackendCapabilitiesState,
    backendCapabilitiesInitialState,
} from "./backendCapabilitiesState.js";

const backendCapabilitiesSlice = createSlice({
    name: "backendCapabilities",
    initialState: backendCapabilitiesInitialState,
    reducers: backendCapabilitiesReducers,
});

export const backendCapabilitiesSliceReducer: Reducer<BackendCapabilitiesState> =
    backendCapabilitiesSlice.reducer;

// Spread "fixes" TS2742 error
export const backendCapabilitiesActions = { ...backendCapabilitiesSlice.actions };
