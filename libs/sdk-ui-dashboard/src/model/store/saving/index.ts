// (C) 2021-2025 GoodData Corporation
import { createSlice, Reducer } from "@reduxjs/toolkit";
import { savingInitialState, SavingState } from "./savingState.js";
import { savingReducers } from "./savingReducers.js";

const savingSlice = createSlice({
    name: "savingSlice",
    initialState: savingInitialState,
    reducers: savingReducers,
});

export const savingSliceReducer: Reducer<SavingState> = savingSlice.reducer;

// Spread "fixes" TS2742 error
export const savingActions = { ...savingSlice.actions };
