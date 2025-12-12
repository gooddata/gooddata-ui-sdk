// (C) 2021-2025 GoodData Corporation
import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { renderModeReducers } from "./renderModeReducers.js";
import { type RenderModeState, renderModeInitialState } from "./renderModeState.js";

const renderModeSlice = createSlice({
    name: "renderModeSlice",
    initialState: renderModeInitialState,
    reducers: renderModeReducers,
});

export const renderModeSliceReducer: Reducer<RenderModeState> = renderModeSlice.reducer;

// Spread "fixes" TS2742 error
/**
 * Actions to control renderMode state of the dashboard.
 *
 * @internal
 */
export const renderModeActions = { ...renderModeSlice.actions };
