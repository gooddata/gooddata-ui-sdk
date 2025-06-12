// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { uiInitialState } from "./uiState.js";
import { uiReducers } from "./uiReducers.js";

const uiSlice = createSlice({
    name: "uiSlice",
    initialState: uiInitialState,
    reducers: uiReducers,
});

export const uiSliceReducer = uiSlice.reducer;

/**
 * Actions to control ui state of the dashboard.
 *
 * @internal
 */
export const uiActions = uiSlice.actions;
