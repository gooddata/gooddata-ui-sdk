// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { drillReducers } from "./drillReducers";
import { drillInitialState } from "./drillState";

const drillSlice = createSlice({
    name: "meta",
    initialState: drillInitialState,
    reducers: drillReducers,
});

export const drillSliceReducer = drillSlice.reducer;
export const drillActions = drillSlice.actions;
