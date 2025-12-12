// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type LoadingState } from "./loadingState.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.loading,
);

/**
 * @internal
 */
export const selectDashboardLoading: DashboardSelector<LoadingState> = selectSelf;

/**
 * @internal
 */
export const selectIsDashboardLoading: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.loading,
);
