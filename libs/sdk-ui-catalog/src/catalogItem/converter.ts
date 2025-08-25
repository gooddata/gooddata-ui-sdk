// (C) 2025 GoodData Corporation

import type { IInsight, IListedDashboard } from "@gooddata/sdk-model";

import type { ICatalogItem } from "./types.js";
import { parseBackendDate } from "../utils/date.js";

export function convertDashboardToCatalogItem(dashboard: IListedDashboard): ICatalogItem {
    const updatedAt = dashboard.updated || dashboard.created;
    return {
        id: dashboard.identifier,
        type: "dashboard",
        title: dashboard.title,
        tags: dashboard.tags ?? [],
        createdBy: dashboard.createdBy?.login ?? "",
        updatedAt: updatedAt ? parseBackendDate(updatedAt) : null,
    };
}

export function convertInsightToCatalogItem({ insight }: IInsight): ICatalogItem {
    const updatedAt = insight.updated || insight.created;
    return {
        id: insight.identifier,
        type: "visualization",
        title: insight.title,
        tags: insight.tags ?? [],
        createdBy: insight.createdBy?.login ?? "",
        updatedAt: updatedAt ? parseBackendDate(updatedAt) : null,
    };
}
