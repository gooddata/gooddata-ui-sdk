// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getProjectId } from "./bootstrap_selector.js";

export type AnalyticalDashboardUriFactory = (dashboardId: string) => string;
export type DocumentUriFactory = (documentId: string) => string;

export const analyticalDashboardUriFactorySelector = createSelector(
    getProjectId,
    (projectId): AnalyticalDashboardUriFactory =>
        (dashboardId: string) =>
            `/workspace/${projectId}/dashboards/#/dashboard/${dashboardId}`,
);

export const documentUriFactorySelector = createSelector(
    getProjectId,
    (projectId): DocumentUriFactory =>
        (documentId: string) =>
            `/workspace/${projectId}/reports/document/${encodeURIComponent(documentId)}`,
);
