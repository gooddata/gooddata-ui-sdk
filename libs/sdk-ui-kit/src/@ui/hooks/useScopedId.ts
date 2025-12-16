// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { createContextStore } from "@gooddata/sdk-ui";

import { useIdPrefixed } from "../../utils/useId.js";

/**
 * @internal
 */
export const useScopedIdStoreValue = <T>(getIdFromItem: (item: T) => string) => {
    const containerId = useIdPrefixed("scoped-id-store");

    const makeId = useCallback(
        ({ item, specifier }: { item: T; specifier?: string }) => {
            const specifierPart = specifier ? `-${specifier}` : "";

            return CSS.escape(`${containerId}-${getIdFromItem(item)}${specifierPart}`.replace(/\s/g, "_"));
        },
        [containerId, getIdFromItem],
    );

    return { makeId, containerId } satisfies IScopedIdStoreValue;
};

/**
 * Returns a unique id for the given item and specifier. If the item is not provided, the container id is returned.
 *
 * @internal
 */
export function useScopedId<T>(item?: T, specifier?: string) {
    const { makeId, containerId } = ScopedIdStore.useContextStoreValues(["containerId", "makeId"]) ?? {};

    return item ? makeId({ item, specifier }) : containerId;
}

/**
 * Returns a unique id for the given item and specifier. If the item is not provided, the container id is returned.
 * If no ScopedIdStore is available, returns undefined.
 *
 * @internal
 */
export function useScopedIdOptional<T>(item?: T, specifier?: string) {
    const { makeId, containerId } =
        ScopedIdStore.useContextStoreValuesOptional(["containerId", "makeId"]) ?? {};

    return item ? makeId?.({ item, specifier }) : containerId;
}

/**
 * @internal
 */
export interface IScopedIdStoreValue {
    makeId: (params: { item: any; specifier?: string }) => string;
    containerId: string;
}

/**
 * @internal
 */
export const ScopedIdStore = createContextStore<IScopedIdStoreValue>("ScopedIdStore");
