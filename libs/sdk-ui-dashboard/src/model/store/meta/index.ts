// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { metaReducers } from "./metaReducers.js";
import { metaInitialState } from "./metaState.js";

const metaSlice = createSlice({
    name: "meta",
    initialState: metaInitialState,
    reducers: metaReducers,
});

export const metaSliceReducer = metaSlice.reducer;
export const metaActions = metaSlice.actions;
