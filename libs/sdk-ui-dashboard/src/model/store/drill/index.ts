// (C) 2021-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { drillReducers } from "./drillReducers.js";
import { type IDrillState, drillInitialState } from "./drillState.js";

const drillSlice = createSlice({
    name: "drill",
    initialState: drillInitialState,
    reducers: drillReducers,
});

export const drillSliceReducer: Reducer<IDrillState> = drillSlice.reducer;

/**
 * @internal
 */
export const drillActions = { ...drillSlice.actions };
