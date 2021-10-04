// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { configReducers } from "./configReducers";
import { configInitialState } from "./configState";

const configSlice = createSlice({
    name: "config",
    initialState: configInitialState,
    reducers: configReducers,
});

export const configSliceReducer = configSlice.reducer;
export const configActions = configSlice.actions;
