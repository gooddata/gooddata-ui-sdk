// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { ConfigState } from "./configState";
import { DashboardConfig } from "../../types/commonTypes";

type ConfigReducer<A extends Action> = CaseReducer<ConfigState, A>;

const setConfig: ConfigReducer<PayloadAction<DashboardConfig>> = (state, action) => {
    state.config = action.payload;
};

export const configReducers = {
    setConfig,
};
