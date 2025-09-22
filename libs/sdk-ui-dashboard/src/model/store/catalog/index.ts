// (C) 2021-2025 GoodData Corporation

import { Reducer, createSlice } from "@reduxjs/toolkit";

import {
    SetCatalogItemsPayload,
    SetCatalogMeasuresAndFactsPayload,
    catalogReducers,
} from "./catalogReducers.js";
import { CatalogState, catalogInitialState } from "./catalogState.js";

const catalogSlice = createSlice({
    name: "catalog",
    initialState: catalogInitialState,
    reducers: catalogReducers,
});

export type { SetCatalogMeasuresAndFactsPayload, SetCatalogItemsPayload };

export const catalogSliceReducer: Reducer<CatalogState> = catalogSlice.reducer;

// Spread "fixes" TS2742 error
/**
 * @internal
 */
export const catalogActions = { ...catalogSlice.actions };
