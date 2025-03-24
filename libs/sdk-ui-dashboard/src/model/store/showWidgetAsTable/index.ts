// (C) 2025 GoodData Corporation

import { createSlice, Reducer } from "@reduxjs/toolkit";
import { initialState, ShowWidgetAsTableState } from "./showWidgetAsTableState.js";
import { showWidgetAsTableReducers } from "./showWidgetAsTableReducers.js";

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
