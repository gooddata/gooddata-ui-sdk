// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { loadingInitialState, LoadingState } from "./loadingState.js";
import { loadingReducers } from "./loadingReducers.js";

const loadingSlice = createSlice({
    name: "loadingSlice",
    initialState: loadingInitialState,
    reducers: loadingReducers,
});

export const loadingSliceReducer: Reducer<LoadingState> = loadingSlice.reducer;

// Spread "fixes" TS2742 error
export const loadingActions = { ...loadingSlice.actions };
