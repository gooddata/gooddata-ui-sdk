// (C) 2021-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { entitlementsReducers } from "./entitlementsReducers.js";
import { type IEntitlementsState, entitlementsInitialState } from "./entitlementsState.js";

const entitlementsSlice = createSlice({
    name: "entitlements",
    initialState: entitlementsInitialState,
    reducers: entitlementsReducers,
});

export const entitlementsSliceReducer: Reducer<IEntitlementsState> = entitlementsSlice.reducer;

// Spread "fixes" TS2742 error
export const entitlementsActions = { ...entitlementsSlice.actions };
