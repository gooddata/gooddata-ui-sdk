// (C) 2021-2026 GoodData Corporation

import { type Action, type AnyAction, type CaseReducer } from "@reduxjs/toolkit";

import { type IExecutedState } from "./executedState.js";

type ExecutedReducer<A extends Action = AnyAction> = CaseReducer<IExecutedState, A>;

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
