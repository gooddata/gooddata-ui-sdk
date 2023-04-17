// (C) 2021-2022 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector, DashboardState } from "../types";
import { LoadingState } from "./loadingState";

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
export const selectIsDashboardLoading = createSelector(selectSelf, (state) => state.loading);
