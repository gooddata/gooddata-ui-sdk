// (C) 2024-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { executedInitialState } from "./executedState.js";
import { executedReducers } from "./executedReducers.js";

const executedSlice = createSlice({
    name: "executedSlice",
    initialState: executedInitialState,
    reducers: executedReducers,
});

export const executedSliceReducer = executedSlice.reducer;
export const executedActions = executedSlice.actions;
