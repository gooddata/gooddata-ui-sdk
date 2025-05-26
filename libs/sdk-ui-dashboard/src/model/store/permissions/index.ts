// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { permissionsReducers } from "./permissionsReducers.js";
import { permissionsInitialState } from "./permissionsState.js";

const permissionsSlice = createSlice({
    name: "permissions",
    initialState: permissionsInitialState,
    reducers: permissionsReducers,
});

export const permissionsSliceReducer = permissionsSlice.reducer;
export const permissionsActions = permissionsSlice.actions;
