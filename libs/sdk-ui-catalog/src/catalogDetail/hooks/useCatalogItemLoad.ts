// (C) 2025 GoodData Corporation

import type { IAnalyticalWorkspace } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import {
    convertAttributeToCatalogItem,
    convertDashboardToCatalogItem,
    convertFactToCatalogItem,
    convertInsightToCatalogItem,
    convertMeasureToCatalogItem,
} from "../../catalogItem/converter.js";
import type { ICatalogItem } from "../../catalogItem/index.js";
import type { ObjectType } from "../../objectType/index.js";

export interface UseCatalogItemLoad {
    objectId?: string | null;
    objectType?: ObjectType | null;
    objectDefinition?: Partial<ICatalogItem> | null;
}

export function useCatalogItemLoad({ objectDefinition, objectId, objectType }: UseCatalogItemLoad): {
    status: "loading" | "success" | "error" | "pending";
    item?: ICatalogItem | null;
    error?: Error;
} {
    const id = objectId ?? objectDefinition?.identifier;
    const type = objectType ?? objectDefinition?.type;
    const filled = isCatalogItemFilled(objectDefinition ?? undefined);

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const { status, error, result } = useCancelablePromise<ICatalogItem | undefined>(
        {
            promise: () => {
                // Object id and type are required
                if (!id || !type) {
                    return Promise.resolve(undefined);
                }
                // Object is already loaded
                if (filled) {
                    return Promise.resolve(objectDefinition as ICatalogItem);
                }
                return loadObjectDefinition(backend.workspace(workspace), id, type);
            },
        },
        [backend, workspace, id, type, filled],
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

function isCatalogItemFilled(item: Partial<ICatalogItem> = {}): item is ICatalogItem {
    const keys: (keyof ICatalogItem)[] = [
        "identifier",
        "type",
        "title",
        "description",
        "tags",
        "createdBy",
        "createdAt",
        "updatedBy",
        "updatedAt",
    ];

    return keys.every((key) => !(item[key] === undefined));
}

async function loadObjectDefinition(
    workspace: IAnalyticalWorkspace,
    id: string,
    type: ObjectType,
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
                .getMeasure({
                    type: "measure",
                    identifier: id,
                })
                .then(convertMeasureToCatalogItem);
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
            throw new Error(`Unsupported object type: ${type}`);
    }
}
