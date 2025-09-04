// (C) 2025 GoodData Corporation
import { type Dispatch, type MutableRefObject, type SetStateAction, useCallback } from "react";

import type { ICatalogItem } from "./types.js";

export function useUpdateItemCallback(
    endpointItems: MutableRefObject<ICatalogItem[][]>,
    setItems: Dispatch<SetStateAction<ICatalogItem[]>>,
) {
    return useCallback(
        (updatedItem: Partial<ICatalogItem>) => {
            endpointItems.current.forEach((items) => {
                items.forEach((item, i) => {
                    if (item.identifier === updatedItem.identifier && item.type === updatedItem.type) {
                        items[i] = {
                            ...item,
                            ...updatedItem,
                        };
                    }
                });
            });
            setItems((items) => {
                return items.map((item) => {
                    if (item.identifier === updatedItem.identifier && item.type === updatedItem.type) {
                        return {
                            ...item,
                            ...updatedItem,
                        };
                    }
                    return item;
                });
            });
        },
        [endpointItems, setItems],
    );
}
