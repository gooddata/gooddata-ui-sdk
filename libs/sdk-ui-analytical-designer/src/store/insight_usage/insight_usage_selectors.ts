// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

// The mount path comes straight from constants/state_paths, never from the domain's own
// reducer module (4.4 delivery note — that direction closes an import cycle).
import { getSourceDashboardId } from "../../selectors/route_selector.js";
import { type IAppState } from "../types.js";

import {
    EMPTY_INSIGHT_USAGE_ON_DASHBOARDS,
    getInsightUsageOnDashboards,
    sortDashboards,
} from "./insight_usage_helpers.js";

/** The domain's single input selector. */
export const getInsightUsageState = (state: IAppState) => state.data.insightUsagesOnDashboards;

/**
 * The dialog-facing usage shape, derived on read: accessible/all dashboards with the source
 * dashboard pinned to the top. Relocated verbatim from
 * services/insight_usage_on_dashboards_service.ts.
 */
export const getInsightUsageOnDashboardsSelector = createSelector(
    getInsightUsageState,
    getSourceDashboardId,
    (usage, sourceDashboardId) => {
        if (!usage) {
            return EMPTY_INSIGHT_USAGE_ON_DASHBOARDS;
        }
        const { referencedDashboards, allUserDashboards } = usage;
        const insightUsageOnDashboard = getInsightUsageOnDashboards(referencedDashboards, allUserDashboards);
        return {
            ...insightUsageOnDashboard,
            accessibleDashboards: sortDashboards(
                insightUsageOnDashboard.accessibleDashboards,
                sourceDashboardId,
            ),
        };
    },
);
