// (C) 2025 GoodData Corporation

import type { ICatalogItemQueryOptions } from "./types.js";

const PAGE_SIZE = 50;

export function getDashboardsQuery({
    backend,
    workspace,
    id,
    createdBy,
    tags,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .dashboards()
        .getDashboardsQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy"])
        .withSorting(["title,asc"])
        .withFilter({ id, tags, createdBy });
}

export function getInsightsQuery({
    backend,
    workspace,
    id,
    createdBy,
    tags,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .insights()
        .getInsightsQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy"])
        .withSorting(["title,asc"])
        .withFilter({ id, tags, createdBy });
}

export function getMetricsQuery({
    backend,
    workspace,
    id,
    createdBy,
    tags,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .measures()
        .getMeasuresQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy"])
        .withSorting(["title,asc"])
        .withFilter({ id, tags, createdBy });
}

export function getAttributesQuery({
    backend,
    workspace,
    id,
    tags,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return (
        backend
            .workspace(workspace)
            .attributes()
            .getAttributesQuery()
            .withPage(0)
            .withSize(pageSize)
            //.withInclude(["createdBy"])
            .withSorting(["title,asc"])
            .withFilter({ id, tags })
    );
}

export function getFactsQuery({
    backend,
    workspace,
    id,
    tags,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return (
        backend
            .workspace(workspace)
            .facts()
            .getFactsQuery()
            .withPage(0)
            .withSize(pageSize)
            //.withInclude(["createdBy"])
            .withSorting(["title,asc"])
            .withFilter({ id, tags })
    );
}
