// (C) 2025-2026 GoodData Corporation

import { type Dispatch, type RefObject, type SetStateAction, useCallback } from "react";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import type { ICatalogItem, ICatalogItemRef } from "./types.js";

export function useCatalogItemUpdateCallback(
    endpointItems: RefObject<ICatalogItem[][]>,
    setItems: Dispatch<SetStateAction<ICatalogItem[]>>,
) {
    return useCallback(
        (updatedItem: ICatalogItem) => {
            endpointItems.current.forEach((items) => {
                items.forEach((item, i) => {
                    if (areObjRefsEqual(item, updatedItem)) {
                        items[i] = updatedItem;
                    }
                });
            });
            setItems((items) => {
                return items.map((item) => (areObjRefsEqual(item, updatedItem) ? updatedItem : item));
            });
        },
        [endpointItems, setItems],
    );
}

export function useCatalogItemRemoveCallback(
    endpointItems: RefObject<ICatalogItem[][]>,
    setItems: Dispatch<SetStateAction<ICatalogItem[]>>,
) {
    return useCallback(
        (removedItem: ICatalogItemRef) => {
            endpointItems.current.forEach((items) => {
                for (let index = items.length - 1; index >= 0; index -= 1) {
                    if (areObjRefsEqual(items[index], removedItem)) {
                        items.splice(index, 1);
                    }
                }
            });
            setItems((items) => {
                return items.filter((item) => !areObjRefsEqual(item, removedItem));
            });
        },
        [endpointItems, setItems],
    );
}
