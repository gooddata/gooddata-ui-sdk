// (C) 2021-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type DashboardSelector, type DashboardState } from "../types.js";
import { type IExecutedState } from "./executedState.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.executed,
);

/**
 * @internal
 */
export const selectDashboardExecuted: DashboardSelector<IExecutedState> = selectSelf;

/**
 * @internal
 */
export const selectIsDashboardExecuted: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.executed,
);
