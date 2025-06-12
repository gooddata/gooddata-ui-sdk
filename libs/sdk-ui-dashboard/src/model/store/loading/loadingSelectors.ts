// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { DashboardSelector, DashboardState } from "../types.js";
import { LoadingState } from "./loadingState.js";

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
