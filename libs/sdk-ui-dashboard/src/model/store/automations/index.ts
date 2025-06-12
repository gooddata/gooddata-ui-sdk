// (C) 2024-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { automationsReducers } from "./automationsReducers.js";
import { automationsInitialState } from "./automationsState.js";

const automationsSlice = createSlice({
    name: "automations",
    initialState: automationsInitialState,
    reducers: automationsReducers,
});

export const automationsSliceReducer = automationsSlice.reducer;
export const automationsActions = automationsSlice.actions;
