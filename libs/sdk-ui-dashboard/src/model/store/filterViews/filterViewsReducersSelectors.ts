// (C) 2024-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";
import { IDashboardFilterView, areObjRefsEqual } from "@gooddata/sdk-model";

import { DashboardState, DashboardSelector } from "../types.js";
import { selectDashboardRef } from "../meta/metaSelectors.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.filterViews,
);

/**
 * @alpha
 */
export const selectFilterViews: DashboardSelector<IDashboardFilterView[]> = createSelector(
    selectSelf,
    selectDashboardRef,
    (state, dashboardRef) => {
        invariant(state.filterViews, "attempting to access uninitialized filterViews state");

        return dashboardRef
            ? state.filterViews.find((item) => areObjRefsEqual(item.dashboard, dashboardRef))?.filterViews ??
                  []
            : [];
    },
);

/**
 * @alpha
 */
export const selectFilterViewsAreLoading: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.isLoading,
);
