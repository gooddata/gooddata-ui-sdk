// (C) 2025 GoodData Corporation

import type { ICatalogItemQueryOptions } from "./types.js";

const PAGE_SIZE = 50;

export function getDashboardsQuery({ backend, workspace, createdBy, tags }: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .dashboards()
        .getDashboardsQuery()
        .withPage(0)
        .withSize(PAGE_SIZE)
        .withInclude(["createdBy"])
        .withFilter({ tags, createdBy });
}

export function getInsightsQuery({ backend, workspace, createdBy, tags }: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .insights()
        .getInsightsQuery()
        .withPage(0)
        .withSize(PAGE_SIZE)
        .withInclude(["createdBy"])
        .withFilter({ tags, createdBy });
}
