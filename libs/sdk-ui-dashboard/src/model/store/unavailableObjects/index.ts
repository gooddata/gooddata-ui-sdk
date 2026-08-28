// (C) 2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { unavailableObjectsEntityAdapter } from "./unavailableObjectsEntityAdapter.js";

export type UnavailableObjectsState = ReturnType<typeof unavailableObjectsEntityAdapter.getInitialState>;

const unavailableObjectsSlice = createSlice({
    name: "unavailableObjects",
    initialState: unavailableObjectsEntityAdapter.getInitialState(),
    reducers: {
        setUnavailableObjects: unavailableObjectsEntityAdapter.setAll,
    },
});

export const unavailableObjectsSliceReducer: Reducer<UnavailableObjectsState> =
    unavailableObjectsSlice.reducer;

// Spread "fixes" TS2742 error
export const unavailableObjectsActions = { ...unavailableObjectsSlice.actions };
