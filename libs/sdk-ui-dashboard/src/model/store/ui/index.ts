// (C) 2021-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { uiReducers } from "./uiReducers.js";
import { type IUiState, uiInitialState } from "./uiState.js";

const uiSlice = createSlice({
    name: "uiSlice",
    initialState: uiInitialState,
    reducers: uiReducers,
});

export const uiSliceReducer: Reducer<IUiState> = uiSlice.reducer;

// Spread "fixes" TS2742 error
/**
 * Actions to control ui state of the dashboard.
 *
 * @internal
 */
export const uiActions = { ...uiSlice.actions };
