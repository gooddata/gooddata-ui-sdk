// (C) 2024 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { usersReducers } from "./usersReducers.js";
import { usersInitialState } from "./usersState.js";

const usersSlice = createSlice({
    name: "users",
    initialState: usersInitialState,
    reducers: usersReducers,
});

export const usersSliceReducer = usersSlice.reducer;
export const usersActions = usersSlice.actions;
