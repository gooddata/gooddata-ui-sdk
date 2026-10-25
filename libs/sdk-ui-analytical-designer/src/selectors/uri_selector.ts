// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getProjectId } from "./bootstrap_selector.js";
import { getFeatureFlags } from "./feature_flag_selector.js";

export type AnalyticalDashboardUriFactory = (dashboardId: string) => string;

export const analyticalDashboardUriFactorySelector = createSelector(
    getProjectId,
    getFeatureFlags,
    (projectId, featureFlags) => {
        // With the dashboards shell application enabled the host owns the
        // /workspace/{id}/dashboards/ pathname; otherwise the standalone app carries the
        // workspace inside the hash.
        const useHostRoute = Boolean(featureFlags.enableShellApplication_dashboards);
        return (dashboardId: string) =>
            useHostRoute
                ? `/workspace/${projectId}/dashboards/#/dashboard/${dashboardId}`
                : `/dashboards/#/workspace/${projectId}/dashboard/${dashboardId}`;
    },
);
