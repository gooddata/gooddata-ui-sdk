// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
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
 * Returns whether the current Dashboard is on edit mode.
 *
 * @public
 */
export const selectIsInEditMode: DashboardSelector<boolean> = createSelector(
    selectRenderMode,
    (renderMode) => renderMode === "edit",
);

/**
 * Returns whether the current Dashboard is on export mode.
 *
 * @internal
 */
export const selectIsInExportMode: DashboardSelector<boolean> = createSelector(
    selectRenderMode,
    (renderMode) => renderMode === "export",
);
