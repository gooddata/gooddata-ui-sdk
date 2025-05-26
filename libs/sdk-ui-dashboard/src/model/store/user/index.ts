// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { userReducers } from "./userReducers.js";
import { userInitialState } from "./userState.js";

const userSlice = createSlice({
    name: "user",
    initialState: userInitialState,
    reducers: userReducers,
});

export const userSliceReducer = userSlice.reducer;
export const userActions = userSlice.actions;
