// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { savingInitialState } from "./savingState";
import { savingReducers } from "./savingReducers";

const savingSlice = createSlice({
    name: "savingSlice",
    initialState: savingInitialState,
    reducers: savingReducers,
});

export const savingSliceReducer = savingSlice.reducer;
export const savingActions = savingSlice.actions;
