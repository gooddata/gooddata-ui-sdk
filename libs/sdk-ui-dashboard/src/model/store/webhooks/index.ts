// (C) 2024 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { webhooksReducers } from "./webhooksReducers.js";
import { webhooksInitialState } from "./webhooksState.js";

const webhooksSlice = createSlice({
    name: "webhooks",
    initialState: webhooksInitialState,
    reducers: webhooksReducers,
});

export const webhooksSliceReducer = webhooksSlice.reducer;
export const webhooksActions = webhooksSlice.actions;
