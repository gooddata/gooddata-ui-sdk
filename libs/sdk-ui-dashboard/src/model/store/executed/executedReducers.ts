// (C) 2021-2024 GoodData Corporation
import { Action, AnyAction, CaseReducer } from "@reduxjs/toolkit";
import { ExecutedState } from "./executedState.js";

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
