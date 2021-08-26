// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.drill,
);

/**
 * Returns drillable items that are currently set.
 *
 * @alpha
 */
export const selectDrillableItems = createSelector(selectSelf, (state) => {
    return state.drillableItems;
});
