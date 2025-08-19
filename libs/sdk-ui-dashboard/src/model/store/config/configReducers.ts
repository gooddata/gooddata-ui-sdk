// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { ConfigState } from "./configState.js";
import { ResolvedDashboardConfig } from "../../types/commonTypes.js";

type ConfigReducer<A extends Action> = CaseReducer<ConfigState, A>;

const setConfig: ConfigReducer<PayloadAction<ResolvedDashboardConfig>> = (state, action) => {
    state.config = action.payload;
};

export const configReducers = {
    setConfig,
};
