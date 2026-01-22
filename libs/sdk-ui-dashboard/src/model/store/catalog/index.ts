// (C) 2021-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { catalogReducers } from "./catalogReducers.js";
import { type CatalogState, catalogInitialState } from "./catalogState.js";

const catalogSlice = createSlice({
    name: "catalog",
    initialState: catalogInitialState,
    reducers: catalogReducers,
});

export const catalogSliceReducer: Reducer<CatalogState> = catalogSlice.reducer;

// Spread "fixes" TS2742 error
/**
 * @internal
 */
export const catalogActions = { ...catalogSlice.actions };
