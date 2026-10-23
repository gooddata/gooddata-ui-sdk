// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type ResolvedDashboardConfig } from "../../types/commonTypes.js";

import { type ConfigState } from "./configState.js";

type ConfigReducer<A extends Action> = CaseReducer<ConfigState, A>;

const setConfig: ConfigReducer<PayloadAction<ResolvedDashboardConfig>> = (state, action) => {
    state.config = action.payload;
};

const setAiMode: ConfigReducer<PayloadAction<ResolvedDashboardConfig["aiMode"]>> = (state, action) => {
    if (state.config) {
        state.config.aiMode = action.payload;
    }
};

const setAiReasoningTitle: ConfigReducer<PayloadAction<ResolvedDashboardConfig["aiReasoningTitle"]>> = (
    state,
    action,
) => {
    if (state.config) {
        state.config.aiReasoningTitle = action.payload;
    }
};

export const configReducers = {
    setConfig,
    setAiMode,
    setAiReasoningTitle,
};
