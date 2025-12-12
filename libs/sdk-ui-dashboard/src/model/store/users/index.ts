// (C) 2024-2025 GoodData Corporation
import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { usersReducers } from "./usersReducers.js";
import { type UsersState, usersInitialState } from "./usersState.js";

const usersSlice = createSlice({
    name: "users",
    initialState: usersInitialState,
    reducers: usersReducers,
});

export const usersSliceReducer: Reducer<UsersState> = usersSlice.reducer;

// Spread "fixes" TS2742 error
export const usersActions = { ...usersSlice.actions };
