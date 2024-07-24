// (C) 2024 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { automationsReducers } from "./automationsReducers.js";
import { automationsInitialState } from "./automationsState.js";

const automationsSlice = createSlice({
    name: "automations",
    initialState: automationsInitialState,
    reducers: automationsReducers,
});

export const automationsSliceReducer = automationsSlice.reducer;
export const automationsActions = automationsSlice.actions;
