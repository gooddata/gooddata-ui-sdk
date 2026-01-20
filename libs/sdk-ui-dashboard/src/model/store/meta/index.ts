// (C) 2021-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { metaReducers } from "./metaReducers.js";
import { type IDashboardMetaState, metaInitialState } from "./metaState.js";

const metaSlice = createSlice({
    name: "meta",
    initialState: metaInitialState,
    reducers: metaReducers,
});

export const metaSliceReducer: Reducer<IDashboardMetaState> = metaSlice.reducer;
// Spread "fixes" TS2742 error

/**
 * @internal
 */
export const metaActions = { ...metaSlice.actions };
