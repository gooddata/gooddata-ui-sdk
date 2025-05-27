// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { renderModeInitialState } from "./renderModeState.js";
import { renderModeReducers } from "./renderModeReducers.js";

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
