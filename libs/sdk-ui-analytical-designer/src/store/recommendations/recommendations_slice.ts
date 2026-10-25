// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { uniq } from "lodash-es";
import { type Reducer } from "redux";

import { storeDismissRecommendations } from "./recommendations_actions.js";
import {
    type IDismissedRecommendationsState,
    dismissedRecommendationsInitialState,
} from "./recommendations_state.js";

const recommendationsSlice = createSlice({
    name: "recommendations",
    initialState: dismissedRecommendationsInitialState,
    // (those get RTK's `${name}/${key}` type strings).
    reducers: {},
    extraReducers: (builder) => {
        // Returned rather than mutated: dedup replaces the whole array. The localStorage
        // the persistence lives in recommendations_sagas.ts —
        // reducers stay side-effect free.
        builder.addCase(storeDismissRecommendations, (state, action) =>
            uniq([...state, action.payload.visClass]),
        );
    },
});

export const recommendationsSliceReducer: Reducer<IDismissedRecommendationsState> =
    recommendationsSlice.reducer;
