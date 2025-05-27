// (C) 2024-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { usersReducers } from "./usersReducers.js";
import { usersInitialState } from "./usersState.js";

const usersSlice = createSlice({
    name: "users",
    initialState: usersInitialState,
    reducers: usersReducers,
});

export const usersSliceReducer = usersSlice.reducer;
export const usersActions = usersSlice.actions;
