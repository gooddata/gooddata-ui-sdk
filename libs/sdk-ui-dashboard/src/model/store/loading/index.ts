// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { loadingReducers } from "./loadingReducers.js";
import { LoadingState, loadingInitialState } from "./loadingState.js";

const loadingSlice = createSlice({
    name: "loadingSlice",
    initialState: loadingInitialState,
    reducers: loadingReducers,
});

export const loadingSliceReducer: Reducer<LoadingState> = loadingSlice.reducer;

// Spread "fixes" TS2742 error
export const loadingActions = { ...loadingSlice.actions };
