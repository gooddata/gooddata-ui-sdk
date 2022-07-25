// (C) 2021-2022 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { metaReducers } from "./metaReducers";
import { metaInitialState } from "./metaState";

const metaSlice = createSlice({
    name: "meta",
    initialState: metaInitialState,
    reducers: metaReducers,
});

export const metaSliceReducer = metaSlice.reducer;

/**
 * Actions to control meta state of the dashboard.
 *
 * @internal
 */
export const metaActions = metaSlice.actions;
