// (C) 2025-2026 GoodData Corporation

import type {
    AnalyticsCatalogGenerateDescriptionObjectType,
    IAnalyticalBackend,
} from "@gooddata/sdk-backend-spi";
import { type IParameterMetadataObjectDefinition, type ObjRef, idRef } from "@gooddata/sdk-model";

import type {
    ICatalogItem,
    ICatalogItemAttribute,
    ICatalogItemDashboard,
    ICatalogItemDataSet,
    ICatalogItemFact,
    ICatalogItemInsight,
    ICatalogItemMeasure,
    ICatalogItemParameter,
    ICatalogItemQueryOptions,
    ICatalogItemRef,
} from "./types.js";
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
    certification,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .dashboards()
        .getDashboardsQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy", "modifiedBy", "certifiedBy"])
        .withMetaInclude(["permissions"])
        .withSorting(["title,asc"])
        .withOrigin(origin)
        .withFilter({
            search,
            id,
            excludeId,
            tags,
            excludeTags,
            createdBy,
            excludeCreatedBy,
            isHidden,
            certification,
        })
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
    certification,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .insights()
        .getInsightsQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy", "modifiedBy", "certifiedBy"])
        .withSorting(["title,asc"])
        .withOrigin(origin)
        .withFilter({
            search,
            id,
            excludeId,
            tags,
            excludeTags,
            createdBy,
            excludeCreatedBy,
            isHidden,
            certification,
        })
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
    certification,
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .measures()
        .getMeasuresQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy", "modifiedBy", "certifiedBy"])
        .withSorting(["title,asc"])
        .withOrigin(origin)
        .withFilter({
            search,
            id,
            excludeId,
            tags,
            excludeTags,
            createdBy,
            excludeCreatedBy,
            isHidden,
            certification,
        })
        .withMethod("POST");
}

export function getParametersQuery({
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
    pageSize = PAGE_SIZE,
}: ICatalogItemQueryOptions) {
    return backend
        .workspace(workspace)
        .parameters()
        .getParametersQuery()
        .withPage(0)
        .withSize(pageSize)
        .withInclude(["createdBy", "modifiedBy"])
        .withSorting(["title,asc"])
        .withOrigin(origin)
        .withFilter({
            search,
            id,
            excludeId,
            tags,
            excludeTags,
            createdBy,
            excludeCreatedBy,
        })
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
            .withFilter({
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
            .withFilter({
                dataSetType: "DATE",
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

export function updateCatalogItem(backend: IAnalyticalBackend, workspace: string, item: ICatalogItem) {
    switch (item.type) {
        case "analyticalDashboard":
            return updateDashboardCatalogItemMeta(backend, workspace, item);
        case "measure":
            return updateMeasureCatalogItemMeta(backend, workspace, item);
        case "insight":
            return updateInsightCatalogItemMeta(backend, workspace, item);
        case "attribute":
            return updateAttributeCatalogItemMeta(backend, workspace, item);
        case "fact":
            return updateFactCatalogItemMeta(backend, workspace, item);
        case "dataSet":
            return updateDataSetCatalogItemMeta(backend, workspace, item);
        case "parameter":
            return updateParameterCatalogItemMeta(backend, workspace, item);
        default:
            throw new Error(`Unsupported catalog item type`);
    }
}

function updateDashboardCatalogItemMeta(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemDashboard,
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

function updateMeasureCatalogItemMeta(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemMeasure,
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

function updateInsightCatalogItemMeta(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemInsight,
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

function updateAttributeCatalogItemMeta(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemAttribute,
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

function updateFactCatalogItemMeta(backend: IAnalyticalBackend, workspace: string, item: ICatalogItemFact) {
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

function updateDataSetCatalogItemMeta(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemDataSet,
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

export async function createParameterCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    parameter: IParameterMetadataObjectDefinition,
) {
    return backend.workspace(workspace).parameters().createParameter(parameter);
}

function updateParameterCatalogItemMeta(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemParameter,
) {
    return backend
        .workspace(workspace)
        .parameters()
        .updateParameter({
            ...buildIdentity(item),
            title: item.title,
            description: item.description,
            tags: item.tags,
        });
}

export function updateParameterCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemParameter,
) {
    return backend
        .workspace(workspace)
        .parameters()
        .updateParameter({
            ...buildIdentity(item),
            title: item.title,
            description: item.description,
            tags: item.tags,
            definition: item.definition,
        });
}

export function deleteParameterCatalogItem(backend: IAnalyticalBackend, workspace: string, ref: ObjRef) {
    return backend.workspace(workspace).parameters().deleteParameter(ref);
}

export function updateCatalogItemCertification(
    backend: IAnalyticalBackend,
    workspace: string,
    item: Pick<ICatalogItem, "type" | "identifier" | "certification">,
) {
    const ref = idRef(item.identifier, item.type);

    switch (item.type) {
        case "analyticalDashboard":
            return backend.workspace(workspace).dashboards().setCertification(ref, item.certification);
        case "insight":
            return backend.workspace(workspace).insights().setCertification(ref, item.certification);
        case "measure":
            return backend.workspace(workspace).measures().setCertification(ref, item.certification);
        default:
            throw new Error("Unsupported catalog item type for certification update.");
    }
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
