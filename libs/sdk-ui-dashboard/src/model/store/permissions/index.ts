// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { permissionsReducers } from "./permissionsReducers.js";
import { permissionsInitialState } from "./permissionsState.js";

const permissionsSlice = createSlice({
    name: "permissions",
    initialState: permissionsInitialState,
    reducers: permissionsReducers,
});

export const permissionsSliceReducer = permissionsSlice.reducer;
export const permissionsActions = permissionsSlice.actions;
