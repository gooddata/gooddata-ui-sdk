// (C) 2021-2025 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
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
