// (C) 2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { parametersReducers } from "./parametersReducers.js";
import { type IParametersState, parametersInitialState } from "./parametersState.js";

const parametersSlice = createSlice({
    name: "parameters",
    initialState: parametersInitialState,
    reducers: parametersReducers,
});

export const parametersSliceReducer: Reducer<IParametersState> = parametersSlice.reducer;

/**
 * @internal
 */
export const parametersActions = { ...parametersSlice.actions };
