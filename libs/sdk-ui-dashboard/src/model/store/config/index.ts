// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { configReducers } from "./configReducers.js";
import { configInitialState } from "./configState.js";

const configSlice = createSlice({
    name: "config",
    initialState: configInitialState,
    reducers: configReducers,
});

export const configSliceReducer = configSlice.reducer;
export const configActions = configSlice.actions;
