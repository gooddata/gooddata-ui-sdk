// (C) 2024-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { automationsReducers } from "./automationsReducers.js";
import { type IAutomationsState, automationsInitialState } from "./automationsState.js";

const automationsSlice = createSlice({
    name: "automations",
    initialState: automationsInitialState,
    reducers: automationsReducers,
});

export const automationsSliceReducer: Reducer<IAutomationsState> = automationsSlice.reducer;

// Spread "fixes" TS2742 error
export const automationsActions = { ...automationsSlice.actions };
