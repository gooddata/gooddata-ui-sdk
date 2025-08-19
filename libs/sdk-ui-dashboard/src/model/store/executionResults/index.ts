// (C) 2021-2025 GoodData Corporation

import { Reducer, createSlice } from "@reduxjs/toolkit";

import { executionResultsAdapter } from "./executionResultsEntityAdapter.js";

export type ExecutionResultsState = ReturnType<typeof executionResultsAdapter.getInitialState>;
const executionResultsSlice = createSlice({
    name: "executionResults",
    initialState: executionResultsAdapter.getInitialState(),
    reducers: {
        upsertExecutionResult: executionResultsAdapter.upsertOne,
        clearAllExecutionResults: executionResultsAdapter.removeAll,
    },
});

export const executionResultsSliceReducer: Reducer<ExecutionResultsState> = executionResultsSlice.reducer;

// Spread "fixes" TS2742 error
export const executionResultsActions = { ...executionResultsSlice.actions };
