// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IAppState } from "../types.js";

import { type IExecutionProgressState } from "./execution_progress_state.js";
import { buildExecutionProgressViewModel } from "./execution_progress_view_model.js";
import { buildExecutionStatsViewModel } from "./execution_stats_view_model.js";

export const getExecutionProgressState = (state: IAppState): IExecutionProgressState =>
    state.report.executionProgress;

export const getExecutionProgressViewModel = createSelector(
    [getExecutionProgressState],
    buildExecutionProgressViewModel,
);

export const getExecutionStatsViewModel = createSelector(
    [getExecutionProgressState, getExecutionProgressViewModel],
    buildExecutionStatsViewModel,
);
