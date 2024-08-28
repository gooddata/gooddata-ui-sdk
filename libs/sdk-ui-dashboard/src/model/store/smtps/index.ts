// (C) 2024 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { smtpsReducers } from "./smtpsReducers.js";
import { smtpsInitialState } from "./smtpsState.js";

const smtpsSlice = createSlice({
    name: "smtps",
    initialState: smtpsInitialState,
    reducers: smtpsReducers,
});

export const smtpsSliceReducer = smtpsSlice.reducer;
export const smtpsActions = smtpsSlice.actions;
