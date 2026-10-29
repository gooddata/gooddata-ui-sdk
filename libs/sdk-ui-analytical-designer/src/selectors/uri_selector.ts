// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getProjectId } from "./bootstrap_selector.js";

export type AnalyticalDashboardUriFactory = (dashboardId: string) => string;

export const analyticalDashboardUriFactorySelector = createSelector(
    getProjectId,
    (projectId): AnalyticalDashboardUriFactory =>
        (dashboardId: string) =>
            `/workspace/${projectId}/dashboards/#/dashboard/${dashboardId}`,
);
