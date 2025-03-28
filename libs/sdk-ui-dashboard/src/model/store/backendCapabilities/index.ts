// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { backendCapabilitiesInitialState, BackendCapabilitiesState } from "./backendCapabilitiesState.js";
import { backendCapabilitiesReducers } from "./backendCapabilitiesReducers.js";

const backendCapabilitiesSlice = createSlice({
    name: "backendCapabilities",
    initialState: backendCapabilitiesInitialState,
    reducers: backendCapabilitiesReducers,
});

export const backendCapabilitiesSliceReducer: Reducer<BackendCapabilitiesState> =
    backendCapabilitiesSlice.reducer;

// Spread "fixes" TS2742 error
export const backendCapabilitiesActions = { ...backendCapabilitiesSlice.actions };
