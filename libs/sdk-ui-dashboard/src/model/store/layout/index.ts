// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { layoutInitialState } from "./layoutState.js";
import { layoutReducers } from "./layoutReducers.js";

const layoutSlice = createSlice({
    name: "layout",
    initialState: layoutInitialState,
    reducers: layoutReducers,
});

export const layoutSliceReducer = layoutSlice.reducer;
export const layoutActions = layoutSlice.actions;
