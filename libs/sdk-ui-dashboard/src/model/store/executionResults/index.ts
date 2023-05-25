// (C) 2021 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { executionResultsAdapter } from "./executionResultsEntityAdapter.js";

const executionResultsSlice = createSlice({
    name: "executionResults",
    initialState: executionResultsAdapter.getInitialState(),
    reducers: {
        upsertExecutionResult: executionResultsAdapter.upsertOne,
        clearAllExecutionResults: executionResultsAdapter.removeAll,
    },
});

export const executionResultsSliceReducer = executionResultsSlice.reducer;
export const executionResultsActions = executionResultsSlice.actions;
