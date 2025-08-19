// (C) 2025 GoodData Corporation

import { Reducer, createSlice } from "@reduxjs/toolkit";

import { showWidgetAsTableReducers } from "./showWidgetAsTableReducers.js";
import { ShowWidgetAsTableState, initialState } from "./showWidgetAsTableState.js";

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

export const showWidgetAsTableSliceReducer: Reducer<ShowWidgetAsTableState> = showWidgetAsTableSlice.reducer;
