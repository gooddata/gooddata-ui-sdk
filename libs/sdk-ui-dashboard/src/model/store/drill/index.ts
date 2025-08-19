// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { drillReducers } from "./drillReducers.js";
import { DrillState, drillInitialState } from "./drillState.js";

const drillSlice = createSlice({
    name: "drill",
    initialState: drillInitialState,
    reducers: drillReducers,
});

export const drillSliceReducer: Reducer<DrillState> = drillSlice.reducer;

/**
 * @internal
 */
export const drillActions = { ...drillSlice.actions };
