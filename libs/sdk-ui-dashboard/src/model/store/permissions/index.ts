// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { permissionsReducers } from "./permissionsReducers.js";
import { permissionsInitialState, PermissionsState } from "./permissionsState.js";

const permissionsSlice = createSlice({
    name: "permissions",
    initialState: permissionsInitialState,
    reducers: permissionsReducers,
});

export const permissionsSliceReducer: Reducer<PermissionsState> = permissionsSlice.reducer;

// Spread "fixes" TS2742 error
export const permissionsActions = { ...permissionsSlice.actions };
