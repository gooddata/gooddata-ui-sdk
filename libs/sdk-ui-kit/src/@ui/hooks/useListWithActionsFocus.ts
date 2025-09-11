// (C) 2025 GoodData Corporation

import React from "react";

import { createContextStore } from "@gooddata/sdk-ui";

import { useIdPrefixed } from "../../utils/useId.js";

/**
 * @internal
 */
export function useFocusWithinContainer(idToFocus?: string | null) {
    const containerRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        const container = containerRef.current;
        const elementToFocus = idToFocus ? container?.querySelector(`#${idToFocus}`) : null;

        if (!elementToFocus) {
            return;
        }

        if (!container?.contains(document.activeElement) && container !== document.activeElement) {
            return;
        }

        (elementToFocus as HTMLElement).focus();
    }, [idToFocus]);

    return { containerRef };
}

/**
 * @internal
 */
export const useListWithActionsFocusStoreValue = <T>(getIdFromItem: (item: T) => string) => {
    const containerId = useIdPrefixed("focus-store");

    const makeId = React.useCallback(
        ({ item, action }: { item: T; action: string }) =>
            CSS.escape(`${containerId}-${getIdFromItem(item)}-${action}`.replace(/\s/g, "_")),
        [containerId, getIdFromItem],
    );

    return { makeId, containerId };
};

/**
 * @internal
 */
export const ListWithActionsFocusStore =
    createContextStore<ReturnType<typeof useListWithActionsFocusStoreValue>>("FocusStore");
