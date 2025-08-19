// (C) 2021-2025 GoodData Corporation
import { Reducer, createSlice } from "@reduxjs/toolkit";

import { savingReducers } from "./savingReducers.js";
import { SavingState, savingInitialState } from "./savingState.js";

const savingSlice = createSlice({
    name: "savingSlice",
    initialState: savingInitialState,
    reducers: savingReducers,
});

export const savingSliceReducer: Reducer<SavingState> = savingSlice.reducer;

// Spread "fixes" TS2742 error
export const savingActions = { ...savingSlice.actions };
