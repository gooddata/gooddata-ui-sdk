// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { selectListedDashboards } from "./listedDashboardsSelectors.js";
import { selectDashboardId } from "../meta/metaSelectors.js";
import { type DashboardSelector } from "../types.js";

/**
 * Selects AI-generated summary of the currently opened dashboard, if available.
 *
 * @internal
 */
export const selectCurrentDashboardSummary: DashboardSelector<string | undefined> = createSelector(
    selectDashboardId,
    selectListedDashboards,
    (dashboardId, listedDashboards) => {
        if (!dashboardId) {
            return undefined;
        }

        return listedDashboards.find((d) => d.identifier === dashboardId)?.summary;
    },
);
