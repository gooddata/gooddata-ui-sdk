// (C) 2021-2023 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector, DashboardState } from "../types";
import { SavingState } from "./savingState";

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
