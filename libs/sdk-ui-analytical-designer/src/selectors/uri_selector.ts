// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type ObjectType } from "@gooddata/sdk-model";

import { isDocument } from "../store/insight_usage/insight_usage_helpers.js";

import { getProjectId } from "./bootstrap_selector.js";

export type AnalyticalDashboardUriFactory = (dashboardId: string) => string;
/** Returns no path for an object Reports cannot open, such as a template. */
export type DocumentUriFactory = (item: { id: string; type: ObjectType }) => string | undefined;

export const analyticalDashboardUriFactorySelector = createSelector(
    getProjectId,
    (projectId): AnalyticalDashboardUriFactory =>
        (dashboardId: string) =>
            `/workspace/${projectId}/dashboards/#/dashboard/${dashboardId}`,
);

export const documentUriFactorySelector = createSelector(
    getProjectId,
    (projectId): DocumentUriFactory =>
        (item) =>
            isDocument(item)
                ? `/workspace/${projectId}/reports/document/${encodeURIComponent(item.id)}`
                : undefined,
);
