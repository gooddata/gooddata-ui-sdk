// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.placeholders,
);

/**
 * @alpha
 */
export const selectWidgetPlaceholder = createSelector(selectSelf, (state) => state.widgetPlaceholder);

/**
 * @alpha
 */
export const selectIsWidgetPlaceholderShown = createSelector(
    selectWidgetPlaceholder,
    (placeholder) => !!placeholder,
);
