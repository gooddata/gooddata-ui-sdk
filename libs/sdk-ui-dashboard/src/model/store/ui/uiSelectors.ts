// (C) 2021 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.ui,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailDialogOpen = createSelector(
    selectSelf,
    (state) => state.scheduleEmailDialog.open,
);

/**
 * @alpha
 */
export const selectIsSaveAsDialogOpen = createSelector(selectSelf, (state) => state.saveAsDialog.open);

/**
 * @internal
 */
export const selectFilterBarHeight = createSelector(selectSelf, (state) => state.filterBar.height);

/**
 * @alpha
 */
export const selectFilterBarExpanded = createSelector(selectSelf, (state) => state.filterBar.expanded);
