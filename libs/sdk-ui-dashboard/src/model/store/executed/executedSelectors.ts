// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type ExecutedState } from "./executedState.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.executed,
);

/**
 * @internal
 */
export const selectDashboardExecuted: DashboardSelector<ExecutedState> = selectSelf;

/**
 * @internal
 */
export const selectIsDashboardExecuted: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.executed,
);
