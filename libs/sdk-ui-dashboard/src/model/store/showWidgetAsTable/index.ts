// (C) 2025 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { initialState } from "./showWidgetAsTableState.js";
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

export const showWidgetAsTableSliceReducer = showWidgetAsTableSlice.reducer;
