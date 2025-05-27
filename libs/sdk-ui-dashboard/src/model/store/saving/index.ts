// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { savingInitialState } from "./savingState.js";
import { savingReducers } from "./savingReducers.js";

const savingSlice = createSlice({
    name: "savingSlice",
    initialState: savingInitialState,
    reducers: savingReducers,
});

export const savingSliceReducer = savingSlice.reducer;
export const savingActions = savingSlice.actions;
