// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { filterContextReducers } from "./filterContextReducers.js";
import { filterContextInitialState } from "./filterContextState.js";

const filterContextSlice = createSlice({
    name: "filterContext",
    initialState: filterContextInitialState,
    reducers: filterContextReducers,
});

export const filterContextSliceReducer = filterContextSlice.reducer;
export const filterContextActions = filterContextSlice.actions;
