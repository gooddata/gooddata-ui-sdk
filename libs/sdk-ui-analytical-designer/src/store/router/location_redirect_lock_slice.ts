// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { locationRedirectLock } from "./router_actions.js";

/**
 * `appState.locationRedirectLock` — the redirect lock the save flow holds while it rewrites the
 * hash. The write is a single-leaf payload copy, so this is all there is to it.
 */
const locationRedirectLockSlice = createSlice({
    name: "locationRedirectLock",
    initialState: false as boolean,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(locationRedirectLock, (_state, action) => action.payload.locked);
    },
});

export const locationRedirectLockSliceReducer: Reducer<boolean> = locationRedirectLockSlice.reducer;
