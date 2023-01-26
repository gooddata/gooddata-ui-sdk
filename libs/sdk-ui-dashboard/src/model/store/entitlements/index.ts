// (C) 2021-2023 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { entitlementsReducers } from "./entitlementsReducers";
import { entitlementsInitialState } from "./entitlementsState";

const entitlementsSlice = createSlice({
    name: "entitlements",
    initialState: entitlementsInitialState,
    reducers: entitlementsReducers,
});

export const entitlementsSliceReducer = entitlementsSlice.reducer;
export const entitlementsActions = entitlementsSlice.actions;
