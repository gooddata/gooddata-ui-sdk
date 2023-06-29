// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { loadingInitialState } from "./loadingState.js";
import { loadingReducers } from "./loadingReducers.js";

const loadingSlice = createSlice({
    name: "loadingSlice",
    initialState: loadingInitialState,
    reducers: loadingReducers,
});

export const loadingSliceReducer = loadingSlice.reducer;
export const loadingActions = loadingSlice.actions;
