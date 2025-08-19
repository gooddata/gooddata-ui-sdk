// (C) 2024-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { executedReducers } from "./executedReducers.js";
import { ExecutedState, executedInitialState } from "./executedState.js";

const executedSlice = createSlice({
    name: "executedSlice",
    initialState: executedInitialState,
    reducers: executedReducers,
});

export const executedSliceReducer: Reducer<ExecutedState> = executedSlice.reducer;

// Spread "fixes" TS2742 error
export const executedActions = { ...executedSlice.actions };
