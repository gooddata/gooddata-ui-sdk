// (C) 2021 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { drillTargetsAdapter } from "./drillTargetsEntityAdapter.js";

const drillTargetsSlice = createSlice({
    name: "drillTargets",
    initialState: drillTargetsAdapter.getInitialState(),
    reducers: {
        addDrillTargets: drillTargetsAdapter.upsertOne,
    },
});

export const drillTargetsReducer = drillTargetsSlice.reducer;

export const drillTargetsActions = drillTargetsSlice.actions;
