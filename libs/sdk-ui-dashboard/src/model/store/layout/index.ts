// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { layoutReducers } from "./layoutReducers.js";
import { LayoutState, layoutInitialState } from "./layoutState.js";

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
