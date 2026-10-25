// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { setRenamingBucketItemEnded, setRenamingBucketItemStarted } from "../../actions/buckets_actions.js";

/**
 * Mini-branch mount for the `appState.renamingBucketItem` boolean. Its only writers are the two
 * renaming actions.
 */
const renamingBucketItemSlice = createSlice({
    name: "renamingBucketItem",
    initialState: false as boolean,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(setRenamingBucketItemStarted, (): boolean => true)
            .addCase(setRenamingBucketItemEnded, (): boolean => false);
    },
});

export const renamingBucketItemSliceReducer: Reducer<boolean> = renamingBucketItemSlice.reducer;
