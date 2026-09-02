// (C) 2025-2026 GoodData Corporation

import type { IAnalyticalWorkspace } from "@gooddata/sdk-backend-spi";
import {
    convertError,
    isNotFound,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import {
    convertAttributeToCatalogItem,
    convertComputedAttributeToCatalogItem,
    convertDashboardToCatalogItem,
    convertDataSetToCatalogItem,
    convertFactToCatalogItem,
    convertInsightToCatalogItem,
    convertMeasureToCatalogItem,
    convertParameterToCatalogItem,
} from "../../catalogItem/converter.js";
import { isCatalogItemLoaded, isCatalogItemMeasure } from "../../catalogItem/guards.js";
import { type ICatalogItem, type ICatalogItemRef } from "../../catalogItem/types.js";
import { type ObjectType } from "../../objectType/types.js";
import { useFeatureFlag } from "../../permission/PermissionsContext.js";

export interface IUseCatalogItemLoad {
    objectId?: string | null;
    objectType?: ObjectType | null;
    objectDefinition?: ICatalogItemRef | ICatalogItem | null;
}

export function useCatalogItemLoad({ objectDefinition, objectId, objectType }: IUseCatalogItemLoad): {
    status: "loading" | "success" | "error" | "pending";
    item?: ICatalogItem | null;
    error?: Error;
} {
    const id = objectId ?? objectDefinition?.identifier;
    const type = objectType ?? objectDefinition?.type;

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const loadPermissions = useFeatureFlag("enableMetricPermissions");
    const filled =
        isCatalogItemLoaded(objectDefinition) && !awaitsPermissions(objectDefinition, loadPermissions);

    const { status, error, result } = useCancelablePromise<ICatalogItem | undefined, Error>(
        {
            promise: () => {
                // Object id and type are required
                if (!id || !type) {
                    return Promise.resolve(undefined);
                }
                // Object is already loaded
                if (filled) {
                    return Promise.resolve(objectDefinition);
                }
                // A 404 must reach CatalogDetailStatus as a NotFoundSdkError so isNotFound() shows
                // the not-found page; convertError maps it. Other errors are rethrown untouched so
                // their original status/message survives in the generic error description.
                return loadObjectDefinition(backend.workspace(workspace), id, type, loadPermissions).catch(
                    (e) => {
                        const converted = convertError(e);
                        throw isNotFound(converted) ? converted : e;
                    },
                );
            },
        },
        [backend, workspace, id, type, filled, loadPermissions],
    );

    // Object id is required
    if (!id) {
        return {
            status: "error",
            error: new Error("The object id is required"),
        };
    }
    // Object type is required
    if (!type) {
        return {
            status: "error",
            error: new Error("The object type is required"),
        };
    }

    return {
        status,
        error,
        item: result,
    };
}

// A metric handed over by a producer that cannot return permissions (a semantic-search hit) has to
// be fetched for them, or its own EDIT and SHARE would read as absent.
function awaitsPermissions(item: ICatalogItem, loadPermissions: boolean): boolean {
    return loadPermissions && isCatalogItemMeasure(item) && item.permissions === undefined;
}

async function loadObjectDefinition(
    workspace: IAnalyticalWorkspace,
    id: string,
    type: ObjectType,
    loadPermissions: boolean,
): Promise<ICatalogItem> {
    switch (type) {
        case "attribute":
            return workspace
                .attributes()
                .getAttribute(
                    {
                        type: "attribute",
                        identifier: id,
                    },
                    {
                        include: ["dataset"],
                    },
                )
                .then(convertAttributeToCatalogItem);
        case "dataSet":
            return workspace
                .datasets()
                .getDataset({
                    type: "dataSet",
                    identifier: id,
                })
                .then(convertDataSetToCatalogItem);
        case "analyticalDashboard":
            return workspace
                .dashboards()
                .getDashboard(
                    {
                        type: "analyticalDashboard",
                        identifier: id,
                    },
                    undefined,
                    {
                        loadUserData: true,
                    },
                )
                .then(convertDashboardToCatalogItem);
        case "insight":
            return workspace
                .insights()
                .getInsight(
                    {
                        type: "insight",
                        identifier: id,
                    },
                    {
                        loadUserData: true,
                    },
                )
                .then(convertInsightToCatalogItem);
        case "measure":
            return workspace
                .measures()
                .getMeasure(
                    {
                        type: "measure",
                        identifier: id,
                    },
                    {
                        loadUserData: true,
                        ...(loadPermissions ? { loadPermissions: true } : {}),
                    },
                )
                .then(convertMeasureToCatalogItem);
        case "parameter":
            return workspace
                .parameters()
                .getParameter({
                    type: "parameter",
                    identifier: id,
                })
                .then(convertParameterToCatalogItem);
        case "computedAttribute":
            return workspace
                .computedAttributes()
                .getComputedAttribute(
                    {
                        type: "computedAttribute",
                        identifier: id,
                    },
                    {
                        loadUserData: true,
                    },
                )
                .then(convertComputedAttributeToCatalogItem);
        case "fact":
            return workspace
                .facts()
                .getFact(
                    {
                        type: "fact",
                        identifier: id,
                    },
                    {
                        include: ["dataset"],
                    },
                )
                .then(convertFactToCatalogItem);
        default:
            throw new Error("Unsupported object type");
    }
}
