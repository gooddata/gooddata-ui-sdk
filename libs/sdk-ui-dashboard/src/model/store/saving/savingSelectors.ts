// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { SavingState } from "./savingState.js";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.saving,
);

/**
 * @internal
 */
export const selectDashboardSaving: DashboardSelector<SavingState> = selectSelf;

/**
 * @public
 */
export const selectIsDashboardSaving: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.saving,
);
