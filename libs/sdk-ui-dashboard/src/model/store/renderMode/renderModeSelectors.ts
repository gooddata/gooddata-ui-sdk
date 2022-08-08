// (C) 2021-2022 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.renderMode,
);

/**
 * @internal
 */
export const selectRenderMode = createSelector(selectSelf, (state) => state.renderMode);

/**
 * @internal
 */
export const selectIsInViewMode = createSelector(selectSelf, (state) => state.renderMode === "view");

/**
 * @internal
 */
export const selectIsInEditMode = createSelector(selectSelf, (state) => state.renderMode === "edit");
