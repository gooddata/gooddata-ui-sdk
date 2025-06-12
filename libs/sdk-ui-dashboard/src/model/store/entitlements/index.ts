// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { entitlementsReducers } from "./entitlementsReducers.js";
import { entitlementsInitialState } from "./entitlementsState.js";

const entitlementsSlice = createSlice({
    name: "entitlements",
    initialState: entitlementsInitialState,
    reducers: entitlementsReducers,
});

export const entitlementsSliceReducer = entitlementsSlice.reducer;
export const entitlementsActions = entitlementsSlice.actions;
