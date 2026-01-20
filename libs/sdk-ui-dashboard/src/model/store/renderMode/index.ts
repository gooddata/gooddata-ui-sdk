// (C) 2021-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { renderModeReducers } from "./renderModeReducers.js";
import { type IRenderModeState, renderModeInitialState } from "./renderModeState.js";

const renderModeSlice = createSlice({
    name: "renderModeSlice",
    initialState: renderModeInitialState,
    reducers: renderModeReducers,
});

export const renderModeSliceReducer: Reducer<IRenderModeState> = renderModeSlice.reducer;

// Spread "fixes" TS2742 error
/**
 * Actions to control renderMode state of the dashboard.
 *
 * @internal
 */
export const renderModeActions = { ...renderModeSlice.actions };
