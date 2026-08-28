// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type DashboardSelector } from "../types.js";

import { selectIsWorkingFilterContextChanged } from "./filterContext/filterContextSelectors.js";
import { selectIsWorkingParametersChanged } from "./parameters/parametersSelectors.js";

/**
 * True when the active tab has staged filters or staged parameter values that "Apply All" has not
 * applied yet.
 *
 * @alpha
 */
export const selectIsWorkingSelectionChanged: DashboardSelector<boolean> = createSelector(
    selectIsWorkingFilterContextChanged,
    selectIsWorkingParametersChanged,
    (isFilterContextChanged, isParametersChanged) => Boolean(isFilterContextChanged) || isParametersChanged,
);
