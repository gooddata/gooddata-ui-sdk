// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { areAllCompatibleMeasuresSelected } from "../services/over_time_comparison_service.js";

export const compareSelector = createSelector(
    areAllCompatibleMeasuresSelected,
    (incompatibleMeasurePresent) => ({
        incompatibleMeasurePresent,
    }),
);
