// (C) 2023-2024 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

import { predictionInitialState } from "./predictionState.js";
import { predictionReducers } from "./predictionReducers.js";

const configSlice = createSlice({
    name: "prediction",
    initialState: predictionInitialState,
    reducers: predictionReducers,
});

export const predictionSliceReducer = configSlice.reducer;
export const predictionActions = configSlice.actions;
