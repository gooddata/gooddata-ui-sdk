// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { drillReducers } from "./drillReducers.js";
import { drillInitialState } from "./drillState.js";

const drillSlice = createSlice({
    name: "drill",
    initialState: drillInitialState,
    reducers: drillReducers,
});

export const drillSliceReducer = drillSlice.reducer;

/**
 * @internal
 */
export const drillActions = drillSlice.actions;
