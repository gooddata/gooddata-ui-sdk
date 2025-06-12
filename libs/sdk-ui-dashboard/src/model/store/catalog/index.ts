// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { catalogReducers } from "./catalogReducers.js";
import { catalogInitialState } from "./catalogState.js";

const catalogSlice = createSlice({
    name: "catalog",
    initialState: catalogInitialState,
    reducers: catalogReducers,
});

export const catalogSliceReducer = catalogSlice.reducer;

/**
 * @internal
 */
export const catalogActions = catalogSlice.actions;
