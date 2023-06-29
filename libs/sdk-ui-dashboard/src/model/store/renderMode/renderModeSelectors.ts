// (C) 2021-2023 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector, DashboardState } from "../types.js";
import { RenderMode } from "../../../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.renderMode,
);

/**
 * @internal
 */
export const selectRenderMode: DashboardSelector<RenderMode> = createSelector(
    selectSelf,
    (state) => state.renderMode,
);

/**
 * @internal
 */
export const selectIsInViewMode: DashboardSelector<boolean> = createSelector(
    selectRenderMode,
    (renderMode) => renderMode === "view",
);

/**
 * @internal
 */
export const selectIsInEditMode: DashboardSelector<boolean> = createSelector(
    selectRenderMode,
    (renderMode) => renderMode === "edit",
);
