// (C) 2021-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { loadingReducers } from "./loadingReducers.js";
import { type ILoadingState, loadingInitialState } from "./loadingState.js";

const loadingSlice = createSlice({
    name: "loadingSlice",
    initialState: loadingInitialState,
    reducers: loadingReducers,
});

export const loadingSliceReducer: Reducer<ILoadingState> = loadingSlice.reducer;

// Spread "fixes" TS2742 error
export const loadingActions = { ...loadingSlice.actions };
