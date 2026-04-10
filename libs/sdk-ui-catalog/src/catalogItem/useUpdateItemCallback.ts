// (C) 2025-2026 GoodData Corporation

import { type Dispatch, type RefObject, type SetStateAction, useCallback } from "react";

import type { ICatalogItem } from "./types.js";

export function useUpdateItemCallback(
    endpointItems: RefObject<ICatalogItem[][]>,
    setItems: Dispatch<SetStateAction<ICatalogItem[]>>,
) {
    return useCallback(
        (updatedItem: ICatalogItem) => {
            endpointItems.current.forEach((items) => {
                items.forEach((item, i) => {
                    if (isMatch(item, updatedItem)) {
                        items[i] = updatedItem;
                    }
                });
            });
            setItems((items) => {
                return items.map((item) => (isMatch(item, updatedItem) ? updatedItem : item));
            });
        },
        [endpointItems, setItems],
    );
}

function isMatch(item: ICatalogItem, updatedItem: ICatalogItem): boolean {
    return item.identifier === updatedItem.identifier && item.type === updatedItem.type;
}
