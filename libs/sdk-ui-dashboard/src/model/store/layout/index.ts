// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { layoutInitialState, LayoutState } from "./layoutState.js";
import { layoutReducers } from "./layoutReducers.js";

const layoutSlice = createSlice({
    name: "layout",
    initialState: layoutInitialState,
    reducers: layoutReducers,
});

export const layoutSliceReducer: Reducer<LayoutState> = layoutSlice.reducer;

// Spread "fixes" TS2742 error
/**
 * Actions to control dashboard layout.
 *
 * @internal
 */
export const layoutActions = { ...layoutSlice.actions };
