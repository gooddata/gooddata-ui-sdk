// (C) 2021-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type DashboardSelector, type DashboardState } from "../types.js";
import { type SavingState } from "./savingState.js";

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
