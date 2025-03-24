// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { renderModeInitialState, RenderModeState } from "./renderModeState.js";
import { renderModeReducers } from "./renderModeReducers.js";

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
