// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { metaReducers } from "./metaReducers.js";
import { metaInitialState } from "./metaState.js";

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
