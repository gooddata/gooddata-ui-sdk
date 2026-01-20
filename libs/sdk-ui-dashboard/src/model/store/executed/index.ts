// (C) 2024-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { executedReducers } from "./executedReducers.js";
import { type IExecutedState, executedInitialState } from "./executedState.js";

const executedSlice = createSlice({
    name: "executedSlice",
    initialState: executedInitialState,
    reducers: executedReducers,
});

export const executedSliceReducer: Reducer<IExecutedState> = executedSlice.reducer;

// Spread "fixes" TS2742 error
export const executedActions = { ...executedSlice.actions };
