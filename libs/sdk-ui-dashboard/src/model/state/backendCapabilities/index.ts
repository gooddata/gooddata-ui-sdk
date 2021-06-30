// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { backendCapabilitiesInitialState } from "./backendCapabilitiesState";
import { backendCapabilitiesReducers } from "./backendCapabilitiesReducers";

const backendCapabilitiesSlice = createSlice({
    name: "backendCapabilities",
    initialState: backendCapabilitiesInitialState,
    reducers: backendCapabilitiesReducers,
});

export const backendCapabilitiesSliceReducer = backendCapabilitiesSlice.reducer;
export const backendCapabilitiesActions = backendCapabilitiesSlice.actions;
