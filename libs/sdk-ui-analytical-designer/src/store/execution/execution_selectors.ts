// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";

import { type IExecutionState } from "./execution_state.js";

export const getExecutionState: (state: IAppState) => IExecutionState = (state: IAppState) =>
    state.report.execution;
