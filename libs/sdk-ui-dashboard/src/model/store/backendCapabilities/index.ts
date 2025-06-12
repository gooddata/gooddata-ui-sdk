// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { backendCapabilitiesInitialState } from "./backendCapabilitiesState.js";
import { backendCapabilitiesReducers } from "./backendCapabilitiesReducers.js";

const backendCapabilitiesSlice = createSlice({
    name: "backendCapabilities",
    initialState: backendCapabilitiesInitialState,
    reducers: backendCapabilitiesReducers,
});

export const backendCapabilitiesSliceReducer = backendCapabilitiesSlice.reducer;
export const backendCapabilitiesActions = backendCapabilitiesSlice.actions;
