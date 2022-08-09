// (C) 2021-2022 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { renderModeInitialState } from "./renderModeState";
import { renderModeReducers } from "./renderModeReducers";

const renderModeSlice = createSlice({
    name: "renderModeSlice",
    initialState: renderModeInitialState,
    reducers: renderModeReducers,
});

export const renderModeSliceReducer = renderModeSlice.reducer;

/**
 * Actions to control renderMode state of the dashboard.
 *
 * @internal
 */
export const renderModeActions = renderModeSlice.actions;
