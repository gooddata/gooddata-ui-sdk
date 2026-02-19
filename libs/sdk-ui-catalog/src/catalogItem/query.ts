// (C) 2025-2026 GoodData Corporation

import type {
    AnalyticsCatalogGenerateDescriptionObjectType,
    IAnalyticalBackend,
} from "@gooddata/sdk-backend-spi";

import type { ICatalogItem, ICatalogItemQueryOptions, ICatalogItemRef } from "./types.js";
import type { ObjectType } from "../objectType/types.js";

const PAGE_SIZE = 50;

/**
 * Type guard for catalog object types supported by AI description generation.
 * @internal
 */
export function isGenerateDescriptionSupportedObjectType(
    objectType: ObjectType,
): objectType is AnalyticsCatalogGenerateDescriptionObjectType {
    return (
        objectType === "insight" ||
        objectType === "analyticalDashboard" ||
        objectType === "measure" ||
        objectType === "fact" ||
        objectType === "attribute"
    );
}

export function getDashboardsQuery({
    backend,
    workspace,
    search,
    origin,
    id,
    excludeId,
    createdBy,
    excludeCreatedBy,
    tags,
    excludeTags,
    isHidden,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .dashboards()
        .getDashboardsQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy", "modifiedBy"])
        .withMetaInclude(["permissions"])
        .withSorting(["title,asc"])
        .withOrigin(origin)
        .withFilter({ search, id, excludeId, tags, excludeTags, createdBy, excludeCreatedBy, isHidden })
        .withMethod("POST");
}

export function getInsightsQuery({
    backend,
    workspace,
    search,
    origin,
    id,
    excludeId,
    createdBy,
    excludeCreatedBy,
    tags,
    excludeTags,
    isHidden,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .insights()
        .getInsightsQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy", "modifiedBy"])
        .withSorting(["title,asc"])
        .withOrigin(origin)
        .withFilter({ search, id, excludeId, tags, excludeTags, createdBy, excludeCreatedBy, isHidden })
        .withMethod("POST");
}

export function getMetricsQuery({
    backend,
    workspace,
    search,
    origin,
    id,
    excludeId,
    createdBy,
    excludeCreatedBy,
    tags,
    excludeTags,
    isHidden,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .measures()
        .getMeasuresQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy", "modifiedBy"])
        .withSorting(["title,asc"])
        .withOrigin(origin)
        .withFilter({ search, id, excludeId, tags, excludeTags, createdBy, excludeCreatedBy, isHidden })
        .withMethod("POST");
}

export function getAttributesQuery({
    backend,
    workspace,
    search,
    origin,
    id,
    excludeId,
    tags,
    excludeTags,
    isHidden,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return (
        backend
            .workspace(workspace)
            .attributes()
            .getAttributesQuery()
            .withPage(0)
            .withSize(pageSize)
            // TODO: include createdBy once available
            .withInclude(["dataset"])
            .withSorting(["title,asc"])
            .withOrigin(origin)
            .withFilter({
                // Excluding date attributes since those are already handled in date dataset query.
                excludeDateAttributes: true,
                search,
                id,
                excludeId,
                tags,
                excludeTags,
                isHidden,
            })
            .withMethod("POST")
    );
}

export function getFactsQuery({
    backend,
    workspace,
    search,
    origin,
    id,
    excludeId,
    tags,
    excludeTags,
    isHidden,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return (
        backend
            .workspace(workspace)
            .facts()
            .getFactsQuery()
            .withPage(0)
            .withSize(pageSize)
            // TODO: include createdBy once available
            .withInclude(["dataset"])
            .withSorting(["title,asc"])
            .withOrigin(origin)
            .withFilter({ search, id, excludeId, tags, excludeTags, isHidden })
            .withMethod("POST")
    );
}

export function getDateDatasetsQuery({
    backend,
    workspace,
    search,
    origin,
    id,
    excludeId,
    tags,
    excludeTags,
    isHidden,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return (
        backend
            .workspace(workspace)
            .datasets()
            .getDatasetsQuery()
            .withPage(0)
            .withSize(pageSize)
            .withInclude(["attributes"])
            .withSorting(["title,asc"])
            .withOrigin(origin)
            // NOTE: Date datasets do not currently support createdBy filtering.
            .withFilter({ dataSetType: "DATE", search, id, excludeId, tags, excludeTags, isHidden })
            .withMethod("POST")
    );
}

export function updateCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    item: Partial<ICatalogItem> & ICatalogItemRef,
) {
    switch (item.type) {
        case "analyticalDashboard":
            return updateDashboardCatalogItem(backend, workspace, item);
        case "measure":
            return updateMeasureCatalogItem(backend, workspace, item);
        case "insight":
            return updateInsightCatalogItem(backend, workspace, item);
        case "attribute":
            return updateAttributeCatalogItem(backend, workspace, item);
        case "fact":
            return updateFactCatalogItem(backend, workspace, item);
        case "dataSet":
            return updateDataSetCatalogItem(backend, workspace, item);
        default:
            throw new Error(`Unsupported catalog item type: ${item.type}`);
    }
}

function updateDashboardCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    item: Partial<ICatalogItem> & ICatalogItemRef,
) {
    return backend
        .workspace(workspace)
        .dashboards()
        .updateDashboardMeta({
            ...buildIdentity(item),
            title: item.title,
            description: item.description,
            tags: item.tags,
        });
}

function updateMeasureCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    item: Partial<ICatalogItem> & ICatalogItemRef,
) {
    return backend
        .workspace(workspace)
        .measures()
        .updateMeasureMeta({
            ...buildIdentity(item),
            title: item.title,
            description: item.description,
            tags: item.tags,
            isHidden: item.isHidden,
            isHiddenFromKda: item.isHiddenFromKda,
        });
}

function updateInsightCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    item: Partial<ICatalogItem> & ICatalogItemRef,
) {
    return backend
        .workspace(workspace)
        .insights()
        .updateInsightMeta({
            ...buildIdentity(item),
            title: item.title,
            description: item.description,
            tags: item.tags,
            isHidden: item.isHidden,
        });
}

function updateAttributeCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    item: Partial<ICatalogItem> & ICatalogItemRef,
) {
    return backend
        .workspace(workspace)
        .attributes()
        .updateAttributeMeta({
            ...buildIdentity(item),
            title: item.title,
            description: item.description,
            tags: item.tags,
            isHidden: item.isHidden,
        });
}

function updateFactCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    item: Partial<ICatalogItem> & ICatalogItemRef,
) {
    return backend
        .workspace(workspace)
        .facts()
        .updateFactMeta({
            ...buildIdentity(item),
            title: item.title,
            description: item.description,
            tags: item.tags,
            isHidden: item.isHidden,
        });
}

function updateDataSetCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    item: Partial<ICatalogItem> & ICatalogItemRef,
) {
    return backend
        .workspace(workspace)
        .datasets()
        .updateDatasetMeta({
            ...buildIdentity(item),
            title: item.title,
            description: item.description,
            tags: item.tags,
        });
}

function buildIdentity(item: ICatalogItemRef) {
    return {
        ref: {
            identifier: item.identifier,
            type: item.type,
        },
        uri: item.identifier,
        identifier: item.identifier,
        id: item.identifier,
    };
}
