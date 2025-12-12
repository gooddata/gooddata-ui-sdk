// (C) 2021-2025 GoodData Corporation
import { type Action, type AnyAction, type CaseReducer } from "@reduxjs/toolkit";

import { type ExecutedState } from "./executedState.js";

type ExecutedReducer<A extends Action = AnyAction> = CaseReducer<ExecutedState, A>;

const setDashboardExecutionStart: ExecutedReducer = (state) => {
    state.executed = false;
};

const setDashboardExecutionDone: ExecutedReducer = (state) => {
    state.executed = true;
};

export const executedReducers = {
    setDashboardExecutionStart,
    setDashboardExecutionDone,
};
