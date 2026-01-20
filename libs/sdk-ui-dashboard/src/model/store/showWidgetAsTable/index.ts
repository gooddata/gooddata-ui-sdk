// (C) 2025-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { showWidgetAsTableReducers } from "./showWidgetAsTableReducers.js";
import { type IShowWidgetAsTableState, initialState } from "./showWidgetAsTableState.js";

const showWidgetAsTableSlice = createSlice({
    name: "showWidgetAsTable",
    initialState,
    reducers: showWidgetAsTableReducers,
});

export const {
    setShowWidgetAsTable,
    clearShowWidgetAsTable,
    addWidgetToShowAsTable,
    removeWidgetToShowAsTable,
} = showWidgetAsTableSlice.actions;

export const showWidgetAsTableSliceReducer: Reducer<IShowWidgetAsTableState> = showWidgetAsTableSlice.reducer;
