// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { filterContextReducers } from "./filterContextReducers.js";
import { filterContextInitialState } from "./filterContextState.js";

const filterContextSlice = createSlice({
    name: "filterContext",
    initialState: filterContextInitialState,
    reducers: filterContextReducers,
});

export const filterContextSliceReducer = filterContextSlice.reducer;
export const filterContextActions = filterContextSlice.actions;
