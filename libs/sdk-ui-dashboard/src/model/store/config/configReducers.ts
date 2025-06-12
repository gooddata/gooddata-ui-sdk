// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { ResolvedDashboardConfig } from "../../types/commonTypes.js";
import { ConfigState } from "./configState.js";

type ConfigReducer<A extends Action> = CaseReducer<ConfigState, A>;

const setConfig: ConfigReducer<PayloadAction<ResolvedDashboardConfig>> = (state, action) => {
    state.config = action.payload;
};

export const configReducers = {
    setConfig,
};
