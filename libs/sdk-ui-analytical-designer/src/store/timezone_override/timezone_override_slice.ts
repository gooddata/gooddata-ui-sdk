// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { setTimezoneOverride } from "../../actions/timezone_override_actions.js";

import { type ITimezoneOverrideState, timezoneOverrideInitialState } from "./timezone_override_state.js";

const timezoneOverrideSlice = createSlice({
    name: "timezoneOverride",
    initialState: timezoneOverrideInitialState as ITimezoneOverrideState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            setTimezoneOverride,
            (_state, action): ITimezoneOverrideState => action.payload ?? null,
        );
    },
});

export const timezoneOverrideSliceReducer: Reducer<ITimezoneOverrideState> = timezoneOverrideSlice.reducer;
