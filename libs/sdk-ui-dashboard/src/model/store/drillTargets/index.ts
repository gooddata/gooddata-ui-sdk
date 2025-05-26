// (C) 2021-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
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
