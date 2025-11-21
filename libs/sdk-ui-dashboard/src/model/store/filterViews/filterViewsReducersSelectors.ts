// (C) 2024-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

import { IDashboardFilterView, areObjRefsEqual } from "@gooddata/sdk-model";

import { selectEnableDashboardTabs } from "../config/configSelectors.js";
import { selectDashboardRef } from "../meta/metaSelectors.js";
import { selectActiveTabLocalIdentifier } from "../tabs/tabsSelectors.js";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.filterViews,
);

/**
 * @alpha
 */
export const selectFilterViews: DashboardSelector<IDashboardFilterView[]> = createSelector(
    selectSelf,
    selectEnableDashboardTabs,
    selectActiveTabLocalIdentifier,
    selectDashboardRef,
    (state, enableDashboardTabs, activeTabLocalIdentifier, dashboardRef) => {
        invariant(state.filterViews, "attempting to access uninitialized filterViews state");

        if (enableDashboardTabs && activeTabLocalIdentifier) {
            return (
                state.filterViews
                    .filter((item) => areObjRefsEqual(item.dashboard, dashboardRef))
                    .flatMap((item) => item.filterViews ?? [])
                    .filter((filterView) => filterView.tabLocalIdentifier === activeTabLocalIdentifier) ?? []
            );
        }

        return dashboardRef
            ? (state.filterViews.find((item) => areObjRefsEqual(item.dashboard, dashboardRef))?.filterViews ??
                  [])
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
