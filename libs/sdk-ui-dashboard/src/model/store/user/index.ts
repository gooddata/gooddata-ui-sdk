// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { userReducers } from "./userReducers.js";
import { userInitialState } from "./userState.js";

const userSlice = createSlice({
    name: "user",
    initialState: userInitialState,
    reducers: userReducers,
});

export const userSliceReducer = userSlice.reducer;
export const userActions = userSlice.actions;
