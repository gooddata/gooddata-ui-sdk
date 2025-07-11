// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { filterContextReducers } from "./filterContextReducers.js";
import { filterContextInitialState, FilterContextState } from "./filterContextState.js";

const filterContextSlice = createSlice({
    name: "filterContext",
    initialState: filterContextInitialState,
    reducers: filterContextReducers,
});

export const filterContextSliceReducer: Reducer<FilterContextState> = filterContextSlice.reducer;

// Spread "fixes" TS2742 error
export const filterContextActions = { ...filterContextSlice.actions };
