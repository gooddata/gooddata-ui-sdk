// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { setFeatureFlagsItems } from "../../actions/featureFlags_actions.js";

import { type IFeatureFlagsState, featureFlagsInitialState } from "./feature_flags_state.js";

const featureFlagsSlice = createSlice({
    name: "featureFlags",
    initialState: featureFlagsInitialState,
    reducers: {},
    extraReducers: (builder) => {
        // each STORE/FEATURE_FLAGS_DATA REPLACES the whole snapshot
        // with a shallow copy of the settings (no merge across workspace switches)
        builder.addCase(setFeatureFlagsItems, (_state, action): IFeatureFlagsState => {
            return { ...action.payload.configs };
        });
    },
});

/** The root featureFlags slice reducer, mounted via feature_flags_reducer.ts. */
export const featureFlagsSliceReducer: Reducer<IFeatureFlagsState> = featureFlagsSlice.reducer;
