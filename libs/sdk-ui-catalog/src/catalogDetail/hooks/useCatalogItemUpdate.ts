// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { isEqual } from "lodash-es";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IUser, MetricType } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { getDisplayName } from "../../catalogItem/converter.js";
import { isCatalogItemHidable, isCatalogItemLoaded, isCatalogItemMeasure } from "../../catalogItem/guards.js";
import { updateCatalogItem, updateCatalogItemCertification } from "../../catalogItem/query.js";
import {
    type ICatalogItem,
    type ICatalogItemMeasure,
    type ICatalogItemRef,
} from "../../catalogItem/types.js";
import { useMounted } from "../../hooks/useMounted.js";
import { type ObjectType } from "../../objectType/types.js";
import { useCatalogItemLoad } from "./useCatalogItemLoad.js";

export interface IUseCatalogItemUpdate {
    currentUser: IUser | null | undefined;
    objectId?: string | null;
    objectType?: ObjectType | null;
    objectDefinition?: ICatalogItemRef | ICatalogItem | null;
    onUpdate?: (item: ICatalogItem) => void;
    onDelete?: (ref: ICatalogItemRef) => void;
    onError?: (error: Error) => void;
}

type PersistHandler<TItem extends ICatalogItem> = (item: TItem) => Promise<void> | void;

export function useCatalogItemUpdate({
    currentUser,
    objectId,
    objectType,
    objectDefinition,
    onUpdate,
    onDelete,
    onError,
}: IUseCatalogItemUpdate) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    //Load or reuse existing item
    const {
        item: loadedItem,
        status,
        error,
    } = useCatalogItemLoad({ objectId, objectType, objectDefinition });

    // Mount check
    const mounted = useMounted();

    // Current item for editing
    const [item, setItem] = useState<ICatalogItem | null | undefined>(loadedItem);
    useEffect(() => {
        setItem(loadedItem);
    }, [loadedItem]);

    // useCatalogItemLoad will not re-run when the identity/filled status is unchanged,
    // so this effect handles parent-driven replacements (e.g. dialog saves).
    useEffect(() => {
        if (isCatalogItemLoaded(objectDefinition)) {
            setItem(objectDefinition);
        }
    }, [objectDefinition]);

    const revertItemUpdate = useCallback(
        (err: Error, currentItem: ICatalogItem | null | undefined) => {
            if (!mounted.current || !currentItem) {
                return;
            }
            setItem(currentItem);
            onError?.(err);
            onUpdate?.(currentItem);
        },
        [mounted, onError, onUpdate],
    );

    /** Sync local state with an item mutation persisted outside this hook; does not re-persist. */
    const applyItemUpdate = useCallback(
        (updated: ICatalogItem) => {
            setItem(updated);
            onUpdate?.(updated);
        },
        [onUpdate],
    );

    /** Sync local state with an item deletion persisted outside this hook; does not re-persist. */
    const applyItemDelete = useCallback(
        (ref: ICatalogItemRef) => {
            setItem(null);
            onDelete?.(ref);
        },
        [onDelete],
    );

    const updateItemTitle = useCallback(
        (title: string) => {
            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    title,
                }),
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, item);
                },
            );
        },
        [backend, currentUser, item, onUpdate, revertItemUpdate, status, workspace],
    );
    const updateItemDescription = useCallback(
        (description: string) => {
            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    description,
                }),
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, item);
                },
            );
        },
        [backend, currentUser, item, onUpdate, revertItemUpdate, status, workspace],
    );
    const updateItemTags = useCallback(
        (tags: string[]) => {
            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    tags,
                }),
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, item);
                },
            );
        },
        [backend, currentUser, item, onUpdate, revertItemUpdate, status, workspace],
    );
    const updateItemIsHidden = useCallback(
        (isHidden: boolean) => {
            if (!isCatalogItemHidable(item)) {
                return;
            }

            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    isHidden,
                }),
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, item);
                },
            );
        },
        [backend, currentUser, item, onUpdate, revertItemUpdate, status, workspace],
    );
    const updateItemIsHiddenFromKda = useCallback(
        (isHiddenFromKda: boolean) => {
            if (!isCatalogItemMeasure(item)) {
                return;
            }

            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    isHiddenFromKda,
                }),
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, item);
                },
            );
        },
        [backend, currentUser, item, onUpdate, revertItemUpdate, status, workspace],
    );
    const persistMeasureChanges = useCallback(
        (nextItem: ICatalogItemMeasure) => persistMeasureMetadata(backend, workspace, nextItem),
        [backend, workspace],
    );
    const updateItemMetricType = useCallback(
        (metricType: MetricType | undefined) => {
            if (!isCatalogItemMeasure(item)) {
                return;
            }

            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    metricType,
                }),
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, item);
                },
                persistMeasureChanges,
            );
        },
        [backend, currentUser, item, onUpdate, persistMeasureChanges, revertItemUpdate, status, workspace],
    );
    const updateItemFormat = useCallback(
        (format: string | null) => {
            if (!isCatalogItemMeasure(item)) {
                return;
            }

            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    format,
                }),
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, item);
                },
                persistMeasureChanges,
            );
        },
        [backend, currentUser, item, onUpdate, persistMeasureChanges, revertItemUpdate, status, workspace],
    );
    const persistCertificationChanges = useCallback(
        (newItem: ICatalogItem) => updateCatalogItemCertification(backend, workspace, newItem),
        [backend, workspace],
    );
    const updateItemCertification = useCallback(
        (certification: ICatalogItem["certification"]) => {
            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    certification: certification
                        ? {
                              ...certification,
                              ...(certification.status === "CERTIFIED"
                                  ? {
                                        certifiedAt: new Date(),
                                        certifiedBy: getDisplayName(currentUser),
                                    }
                                  : {}),
                          }
                        : undefined,
                }),
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, item);
                },
                persistCertificationChanges,
            );
        },
        [
            backend,
            currentUser,
            item,
            onUpdate,
            persistCertificationChanges,
            revertItemUpdate,
            status,
            workspace,
        ],
    );

    return {
        item,
        status,
        error,
        updateItemTitle,
        updateItemDescription,
        updateItemTags,
        updateItemIsHidden,
        updateItemIsHiddenFromKda,
        updateItemMetricType,
        updateItemFormat,
        updateItemCertification,
        applyItemUpdate,
        applyItemDelete,
    };
}

function updateItem<TItem extends ICatalogItem>(
    backend: IAnalyticalBackend,
    workspace: string,
    user: IUser | null | undefined,
    item: TItem | undefined | null,
    disabled: boolean,
    updater: () => Partial<TItem>,
    onUpdate: (newItem: TItem) => void,
    onError: (error: Error) => void,
    persist?: PersistHandler<TItem>,
) {
    if (disabled || !item) {
        return;
    }

    const itemChanges = updater();
    if (!hasChanges(item, itemChanges)) {
        return;
    }

    const newItem = makeUpdatedItem(user, item, itemChanges);

    onUpdate(newItem);
    const persistFn = persist ?? ((nextItem: TItem) => updateCatalogItem(backend, workspace, nextItem));
    Promise.resolve(persistFn(newItem)).catch(onError);
}

function makeUpdatedItem<TItem extends ICatalogItem>(
    user: IUser | undefined | null,
    item: TItem,
    changes: Partial<TItem>,
): TItem {
    return {
        ...item,
        ...changes,
        ...(user
            ? {
                  updatedBy: getDisplayName(user),
              }
            : {
                  updatedBy: "",
              }),
        updatedAt: new Date(),
    };
}

function hasChanges<TItem extends ICatalogItem>(item: TItem, changes: Partial<TItem>): boolean {
    return Object.keys(changes).some((key) => {
        const typedKey = key as keyof TItem;
        return !isEqual(item[typedKey], changes[typedKey]);
    });
}

function persistMeasureMetadata(backend: IAnalyticalBackend, workspace: string, item: ICatalogItemMeasure) {
    return backend
        .workspace(workspace)
        .measures()
        .getMeasure(
            {
                type: "measure",
                identifier: item.identifier,
            },
            {
                loadUserData: true,
            },
        )
        .then((measure) =>
            backend
                .workspace(workspace)
                .measures()
                .updateMeasure({
                    ...measure,
                    format: item.format ?? measure.format,
                    metricType: item.metricType ?? measure.metricType,
                })
                .then(() => undefined),
        );
}
