// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { metaReducers } from "./metaReducers.js";
import { DashboardMetaState, metaInitialState } from "./metaState.js";

const metaSlice = createSlice({
    name: "meta",
    initialState: metaInitialState,
    reducers: metaReducers,
});

export const metaSliceReducer: Reducer<DashboardMetaState> = metaSlice.reducer;
// Spread "fixes" TS2742 error

/**
 * @internal
 */
export const metaActions = { ...metaSlice.actions };
