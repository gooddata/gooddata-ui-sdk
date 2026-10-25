// (C) 2022-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getSortConfig } from "../store/chart_sort/chart_sort_selector.js";

export const canApplyCustomSort = createSelector(getSortConfig, (sortConfig) => {
    return sortConfig.supported;
});
