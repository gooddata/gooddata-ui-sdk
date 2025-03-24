// (C) 2024-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { executedInitialState, ExecutedState } from "./executedState.js";
import { executedReducers } from "./executedReducers.js";

const executedSlice = createSlice({
    name: "executedSlice",
    initialState: executedInitialState,
    reducers: executedReducers,
});

export const executedSliceReducer: Reducer<ExecutedState> = executedSlice.reducer;

// Spread "fixes" TS2742 error
export const executedActions = { ...executedSlice.actions };
