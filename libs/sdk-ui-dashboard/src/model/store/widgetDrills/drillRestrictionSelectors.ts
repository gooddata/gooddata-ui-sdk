// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type DashboardDrillDefinition } from "../../../types.js";
import { selectUnavailableObjects } from "../unavailableObjects/unavailableObjectsSelectors.js";

import { isDrillRestricted } from "./drillRestrictionUtils.js";

export const selectIsDrillRestricted = createSelector(
    selectUnavailableObjects,
    (unavailable) =>
        (drill: DashboardDrillDefinition): boolean =>
            isDrillRestricted(drill, unavailable),
);
