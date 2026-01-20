// (C) 2021-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type ILoadingState } from "./loadingState.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.loading,
);

/**
 * @internal
 */
export const selectDashboardLoading: DashboardSelector<ILoadingState> = selectSelf;

/**
 * @internal
 */
export const selectIsDashboardLoading: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.loading,
);
