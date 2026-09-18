// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { isEqual } from "lodash-es";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type ISemanticConditionalFormatting,
    type IUser,
    type MetricType,
    type ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { getDisplayName } from "../../catalogItem/converter.js";
import {
    isCatalogItemAttribute,
    isCatalogItemHidable,
    isCatalogItemLoaded,
    isCatalogItemMeasure,
    isCatalogItemWithPermissions,
} from "../../catalogItem/guards.js";
import {
    persistLabelConditionalFormatting,
    persistMeasureConditionalFormatting,
    updateCatalogItem,
    updateCatalogItemCertification,
} from "../../catalogItem/query.js";
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

type PersistHandler<TItem extends ICatalogItem> = (item: TItem) => Promise<unknown> | void;

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
            const next = keepPermissions(item, updated);
            setItem(next);
            onUpdate?.(next);
        },
        [item, onUpdate],
    );

    /** Sync local state with an item deletion persisted outside this hook; does not re-persist. */
    const applyItemDelete = useCallback(
        (ref: ICatalogItemRef) => {
            setItem(null);
            onDelete?.(ref);
        },
        [onDelete],
    );

    // One optimistic update flow for every field: apply locally, persist, revert on failure.
    const runUpdate = useCallback(
        <TItem extends ICatalogItem>(
            target: TItem | null | undefined,
            updater: () => Partial<TItem>,
            persist?: PersistHandler<TItem>,
            options?: { touch?: boolean },
        ) => {
            updateItem(
                backend,
                workspace,
                currentUser,
                target,
                status !== "success",
                updater,
                (newItem) => {
                    setItem(newItem);
                    onUpdate?.(newItem);
                },
                (err) => {
                    revertItemUpdate(err, target);
                },
                persist,
                options,
            );
        },
        [backend, currentUser, onUpdate, revertItemUpdate, status, workspace],
    );

    const updateItemTitle = useCallback(
        (title: string) => runUpdate(item, () => ({ title })),
        [item, runUpdate],
    );
    const updateItemDescription = useCallback(
        (description: string) => runUpdate(item, () => ({ description })),
        [item, runUpdate],
    );
    const updateItemTags = useCallback(
        (tags: string[]) => runUpdate(item, () => ({ tags })),
        [item, runUpdate],
    );
    const updateItemIsHidden = useCallback(
        (isHidden: boolean) => {
            if (isCatalogItemHidable(item)) {
                runUpdate(item, () => ({ isHidden }));
            }
        },
        [item, runUpdate],
    );
    const updateItemIsHiddenFromKda = useCallback(
        (isHiddenFromKda: boolean) => {
            if (isCatalogItemMeasure(item)) {
                runUpdate(item, () => ({ isHiddenFromKda }));
            }
        },
        [item, runUpdate],
    );
    const updateItemMetricType = useCallback(
        (metricType: MetricType | undefined) => {
            if (isCatalogItemMeasure(item)) {
                runUpdate(
                    item,
                    () => ({ metricType }),
                    (next) => persistMeasureMetadata(backend, workspace, next),
                );
            }
        },
        [backend, item, runUpdate, workspace],
    );
    const updateItemFormat = useCallback(
        (format: string | null) => {
            if (isCatalogItemMeasure(item)) {
                runUpdate(
                    item,
                    () => ({ format }),
                    (next) => persistMeasureMetadata(backend, workspace, next),
                );
            }
        },
        [backend, item, runUpdate, workspace],
    );
    const updateItemConditionalFormatting = useCallback(
        (conditionalFormatting: ICatalogItemMeasure["conditionalFormatting"]) => {
            if (isCatalogItemMeasure(item)) {
                runUpdate(
                    item,
                    () => ({ conditionalFormatting }),
                    (next) => persistMeasureConditionalFormatting(backend, workspace, next),
                );
            }
        },
        [backend, item, runUpdate, workspace],
    );
    const updateItemLabelConditionalFormatting = useCallback(
        (labelRef: ObjRef, conditionalFormatting: ISemanticConditionalFormatting | undefined) => {
            if (!isCatalogItemAttribute(item)) {
                return;
            }
            const label = item.labels?.find((candidate) => areObjRefsEqual(candidate.ref, labelRef));
            if (!label) {
                return;
            }
            const updatedLabel = { ...label, conditionalFormatting };
            runUpdate(
                item,
                () => ({
                    labels: item.labels?.map((candidate) => (candidate === label ? updatedLabel : candidate)),
                }),
                () => persistLabelConditionalFormatting(backend, workspace, updatedLabel),
                { touch: false },
            );
        },
        [backend, item, runUpdate, workspace],
    );
    const updateItemCertification = useCallback(
        (certification: ICatalogItem["certification"]) =>
            runUpdate(
                item,
                () => ({
                    certification: certification
                        ? {
                              ...certification,
                              ...(certification.status === "CERTIFIED"
                                  ? { certifiedAt: new Date(), certifiedBy: getDisplayName(currentUser) }
                                  : {}),
                          }
                        : undefined,
                }),
                (next) => updateCatalogItemCertification(backend, workspace, next),
            ),
        [backend, currentUser, item, runUpdate, workspace],
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
        updateItemConditionalFormatting,
        updateItemLabelConditionalFormatting,
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
    options: { touch?: boolean } = {},
) {
    if (disabled || !item) {
        return;
    }

    const itemChanges = updater();
    if (!hasChanges(item, itemChanges)) {
        return;
    }

    // A label patch does not touch the attribute itself, so it must not stamp updatedAt/updatedBy.
    const newItem =
        options.touch === false ? { ...item, ...itemChanges } : makeUpdatedItem(user, item, itemChanges);

    onUpdate(newItem);
    const persistFn = persist ?? ((nextItem: TItem) => updateCatalogItem(backend, workspace, nextItem));
    Promise.resolve(persistFn(newItem)).catch(onError);
}

// The update endpoint cannot return permissions, and a save does not change them.
function keepPermissions(previous: ICatalogItem | null | undefined, updated: ICatalogItem): ICatalogItem {
    if (!previous || !isCatalogItemWithPermissions(previous) || !isCatalogItemWithPermissions(updated)) {
        return updated;
    }
    if (previous.identifier !== updated.identifier) {
        return updated;
    }
    if (updated.permissions || !previous.permissions) {
        return updated;
    }
    return { ...updated, permissions: previous.permissions };
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
