// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { uiReducers } from "./uiReducers.js";
import { UiState, uiInitialState } from "./uiState.js";

const uiSlice = createSlice({
    name: "uiSlice",
    initialState: uiInitialState,
    reducers: uiReducers,
});

export const uiSliceReducer: Reducer<UiState> = uiSlice.reducer;

// Spread "fixes" TS2742 error
/**
 * Actions to control ui state of the dashboard.
 *
 * @internal
 */
export const uiActions = { ...uiSlice.actions };
