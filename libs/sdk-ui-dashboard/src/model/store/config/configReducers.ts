// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type ResolvedDashboardConfig } from "../../types/commonTypes.js";
import { type ConfigState } from "./configState.js";

type ConfigReducer<A extends Action> = CaseReducer<ConfigState, A>;

const setConfig: ConfigReducer<PayloadAction<ResolvedDashboardConfig>> = (state, action) => {
    state.config = action.payload;
};

export const configReducers = {
    setConfig,
};
