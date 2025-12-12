// (C) 2021-2025 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type ConfigState } from "./configState.js";
import { type ResolvedDashboardConfig } from "../../types/commonTypes.js";

type ConfigReducer<A extends Action> = CaseReducer<ConfigState, A>;

const setConfig: ConfigReducer<PayloadAction<ResolvedDashboardConfig>> = (state, action) => {
    state.config = action.payload;
};

export const configReducers = {
    setConfig,
};
