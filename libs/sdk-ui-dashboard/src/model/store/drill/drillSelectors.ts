// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { ExplicitDrill } from "@gooddata/sdk-ui";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.drill,
);

/**
 * Returns drillable items that are currently set.
 *
 * @alpha
 */
export const selectDrillableItems: DashboardSelector<ExplicitDrill[]> = createSelector(
    selectSelf,
    (state) => {
        return state.drillableItems;
    },
);
