// (C) 2024-2025 GoodData Corporation
import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { automationsReducers } from "./automationsReducers.js";
import { type AutomationsState, automationsInitialState } from "./automationsState.js";

const automationsSlice = createSlice({
    name: "automations",
    initialState: automationsInitialState,
    reducers: automationsReducers,
});

export const automationsSliceReducer: Reducer<AutomationsState> = automationsSlice.reducer;

// Spread "fixes" TS2742 error
export const automationsActions = { ...automationsSlice.actions };
