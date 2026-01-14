// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { isEqual, transform } from "lodash-es";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IUser, MetricType } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useCatalogItemLoad } from "./useCatalogItemLoad.js";
import { getDisplayName } from "../../catalogItem/converter.js";
import { updateCatalogItem } from "../../catalogItem/query.js";
import type { ICatalogItem, ICatalogItemRef } from "../../catalogItem/types.js";
import { useMounted } from "../../hooks/useMounted.js";
import type { ObjectType } from "../../objectType/index.js";

export interface IUseCatalogItemUpdate {
    currentUser: IUser | null | undefined;
    objectId?: string | null;
    objectType?: ObjectType | null;
    objectDefinition?: Partial<ICatalogItem> | null;
    onUpdate?: (item: ICatalogItem, changes: Partial<ICatalogItem> & ICatalogItemRef) => void;
    onError?: (error: Error) => void;
}

type PersistHandler = (
    changes: Partial<ICatalogItem> & ICatalogItemRef,
    newItem: ICatalogItem,
) => Promise<void> | void;

export function useCatalogItemUpdate({
    currentUser,
    objectId,
    objectType,
    objectDefinition,
    onUpdate,
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
                (newItem, changes) => {
                    setItem(newItem);
                    onUpdate?.(newItem, changes);
                },
                (err) => {
                    if (!mounted.current || !item) {
                        return;
                    }
                    // Revert changes
                    setItem(item);
                    onError?.(err);
                    onUpdate?.(item, item);
                },
            );
        },
        [mounted, backend, currentUser, item, onError, onUpdate, status, workspace],
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
                (newItem, changes) => {
                    setItem(newItem);
                    onUpdate?.(newItem, changes);
                },
                (err) => {
                    if (!mounted.current || !item) {
                        return;
                    }
                    // Revert changes
                    setItem(item);
                    onError?.(err);
                    onUpdate?.(item, item);
                },
            );
        },
        [mounted, backend, currentUser, item, onError, onUpdate, status, workspace],
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
                (newItem, changes) => {
                    setItem(newItem);
                    onUpdate?.(newItem, changes);
                },
                (err) => {
                    if (!mounted.current || !item) {
                        return;
                    }
                    // Revert changes
                    setItem(item);
                    onError?.(err);
                    onUpdate?.(item, item);
                },
            );
        },
        [mounted, backend, currentUser, item, onError, onUpdate, status, workspace],
    );
    const updateItemIsHidden = useCallback(
        (isHidden: boolean) => {
            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    isHidden,
                }),
                (newItem, changes) => {
                    setItem(newItem);
                    onUpdate?.(newItem, changes);
                },
                (err) => {
                    if (!mounted.current || !item) {
                        return;
                    }
                    // Revert changes
                    setItem(item);
                    onError?.(err);
                    onUpdate?.(item, item);
                },
            );
        },
        [mounted, backend, currentUser, item, onError, onUpdate, status, workspace],
    );
    const persistMeasureChanges = useCallback(
        (changes: Partial<ICatalogItem> & ICatalogItemRef) =>
            persistMeasureMetadata(backend, workspace, changes),
        [backend, workspace],
    );
    const updateItemMetricType = useCallback(
        (metricType: MetricType | undefined) => {
            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    metricType,
                }),
                (newItem, changes) => {
                    setItem(newItem);
                    onUpdate?.(newItem, changes);
                },
                (err) => {
                    if (!mounted.current || !item) {
                        return;
                    }
                    setItem(item);
                    onError?.(err);
                    onUpdate?.(item, item);
                },
                persistMeasureChanges,
            );
        },
        [mounted, backend, currentUser, item, onError, onUpdate, persistMeasureChanges, status, workspace],
    );
    const updateItemFormat = useCallback(
        (format: string | null) => {
            updateItem(
                backend,
                workspace,
                currentUser,
                item,
                status !== "success",
                () => ({
                    format,
                }),
                (newItem, changes) => {
                    setItem(newItem);
                    onUpdate?.(newItem, changes);
                },
                (err) => {
                    if (!mounted.current || !item) {
                        return;
                    }
                    setItem(item);
                    onError?.(err);
                    onUpdate?.(item, item);
                },
                persistMeasureChanges,
            );
        },
        [mounted, backend, currentUser, item, onError, onUpdate, persistMeasureChanges, status, workspace],
    );

    return {
        item,
        status,
        error,
        updateItemTitle,
        updateItemDescription,
        updateItemTags,
        updateItemIsHidden,
        updateItemMetricType,
        updateItemFormat,
    };
}

function updateItem(
    backend: IAnalyticalBackend,
    workspace: string,
    user: IUser | null | undefined,
    item: ICatalogItem | undefined | null,
    disabled: boolean,
    updater: () => Partial<ICatalogItem>,
    onUpdate: (newItem: ICatalogItem, changes: Partial<ICatalogItem> & ICatalogItemRef) => void,
    onError: (error: Error) => void,
    persist?: PersistHandler,
) {
    if (disabled || !item) {
        return;
    }

    const { newItem, changes, changed } = makeUpdateToItem(user, item, updater);

    if (!changed) {
        return;
    }

    onUpdate(newItem, changes);
    const persistFn =
        persist ??
        ((itemChanges: Partial<ICatalogItem> & ICatalogItemRef) =>
            updateCatalogItem(backend, workspace, itemChanges));
    Promise.resolve(persistFn(changes, newItem)).catch(onError);
}

function makeUpdateToItem(
    user: IUser | undefined | null,
    item: ICatalogItem,
    updater: () => Partial<ICatalogItem>,
) {
    const newItem: ICatalogItem = {
        ...item,
        ...updater(),
        ...(user
            ? {
                  updatedBy: getDisplayName(user),
              }
            : {
                  updatedBy: "",
              }),
        updatedAt: new Date(),
    };

    const diff = calculateDiff(item, newItem);

    const changes: Partial<ICatalogItem> & ICatalogItemRef = {
        ...diff,
        type: item.type,
        identifier: item.identifier,
    };
    const changed = Object.keys(diff).length > 0;

    return {
        newItem,
        changes,
        changed,
    };
}

function calculateDiff<T extends object>(oldItem: Partial<T>, newItem: Partial<T>) {
    return transform(
        oldItem,
        (result, oldValue, key: keyof T) => {
            const newValue = newItem[key];

            if (Array.isArray(oldValue)) {
                if (!isEqual(oldValue, newValue)) {
                    result[key] = newValue as T[keyof T];
                }
            } else if (!isEqual(oldValue, newValue)) {
                result[key] = newValue as T[keyof T];
            }
        },
        {} as Partial<T>,
    );
}

function persistMeasureMetadata(
    backend: IAnalyticalBackend,
    workspace: string,
    changes: Partial<ICatalogItem> & ICatalogItemRef,
) {
    if (changes.type !== "measure" || (changes.format === undefined && changes.metricType === undefined)) {
        return Promise.resolve();
    }

    return backend
        .workspace(workspace)
        .measures()
        .getMeasure(
            {
                type: "measure",
                identifier: changes.identifier,
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
                    format: changes.format ?? measure.format,
                    metricType: changes.metricType ?? measure.metricType,
                })
                .then(() => undefined),
        );
}
