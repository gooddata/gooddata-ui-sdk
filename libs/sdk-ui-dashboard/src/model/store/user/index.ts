// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { userReducers } from "./userReducers.js";
import { UserState, userInitialState } from "./userState.js";

const userSlice = createSlice({
    name: "user",
    initialState: userInitialState,
    reducers: userReducers,
});

export const userSliceReducer: Reducer<UserState> = userSlice.reducer;

// Spread "fixes" TS2742 error
export const userActions = { ...userSlice.actions };
