// (C) 2019-2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    resetAboutToBeRemovedBucketAndFilterItems,
    resetHighlightedBucketItems,
    resetHighlightedFilterItem,
    setAboutToBeRemovedBucketAndFilterItems,
    setHighlightedBucketItems,
    setHighlightedFilterItem,
} from "./highlighting_actions.js";
import { type IHighlightingState, highlightingInitialState } from "./highlighting_state.js";

const highlightingSlice = createSlice({
    name: "highlighting",
    initialState: highlightingInitialState,
    // (those get RTK's `${name}/${key}` type strings).
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(setHighlightedBucketItems, (state, action) => {
                state.highlightedBucketItems = action.payload.localIdentifiers;
            })
            .addCase(resetHighlightedBucketItems, (state) => {
                state.highlightedBucketItems = undefined;
            })
            .addCase(setAboutToBeRemovedBucketAndFilterItems, (state, action) => {
                state.aboutToBeRemovedBucketAndFilterItems = action.payload.localIdentifiers;
            })
            .addCase(resetAboutToBeRemovedBucketAndFilterItems, (state) => {
                state.aboutToBeRemovedBucketAndFilterItems = undefined;
            })
            .addCase(setHighlightedFilterItem, (state, action) => {
                state.highlightedFilterItem = action.payload.localIdentifier;
            })
            .addCase(resetHighlightedFilterItem, (state) => {
                state.highlightedFilterItem = undefined;
            });
    },
});

export const highlightingSliceReducer: Reducer<IHighlightingState> = highlightingSlice.reducer;
