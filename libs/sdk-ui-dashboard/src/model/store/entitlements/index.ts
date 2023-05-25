// (C) 2021-2023 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { entitlementsReducers } from "./entitlementsReducers.js";
import { entitlementsInitialState } from "./entitlementsState.js";

const entitlementsSlice = createSlice({
    name: "entitlements",
    initialState: entitlementsInitialState,
    reducers: entitlementsReducers,
});

export const entitlementsSliceReducer = entitlementsSlice.reducer;
export const entitlementsActions = entitlementsSlice.actions;
