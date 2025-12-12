// (C) 2021-2025 GoodData Corporation
import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { drillTargetsAdapter } from "./drillTargetsEntityAdapter.js";

export type DrillTargetsState = ReturnType<typeof drillTargetsAdapter.getInitialState>;

const drillTargetsSlice = createSlice({
    name: "drillTargets",
    initialState: drillTargetsAdapter.getInitialState(),
    reducers: {
        addDrillTargets: drillTargetsAdapter.upsertOne,
    },
});

export const drillTargetsReducer: Reducer<DrillTargetsState> = drillTargetsSlice.reducer;

// Spread "fixes" TS2742 error
export const drillTargetsActions = { ...drillTargetsSlice.actions };
