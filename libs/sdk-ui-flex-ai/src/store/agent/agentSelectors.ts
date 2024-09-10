// (C) 2024 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../types.js";
import { agentSliceName } from "./agentSlice.js";

const agentSliceSelector = (state: RootState) => state[agentSliceName];

export const agentLoadingSelector: (state: RootState) => boolean = createSelector(
    agentSliceSelector,
    (state) => state.busy,
);
