// (C) 2021 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.saving,
);

/**
 * @internal
 */
export const selectDashboardSaving = selectSelf;

/**
 * @public
 */
export const selectIsDashboardSaving = createSelector(selectSelf, (state) => state.saving);
