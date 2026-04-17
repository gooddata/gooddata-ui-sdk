// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import type { ICatalogItem, ICatalogItemRef } from "./types.js";
import { useCatalogItemFeed } from "./useCatalogItemFeed.js";
import { type AsyncStatus } from "../async/types.js";
import { useObjectTypeCounterSync } from "../objectType/ObjectTypeContext.js";
import type { ObjectType } from "../objectType/types.js";

export interface ICatalogFeedState {
    items: ICatalogItem[];
    status: AsyncStatus;
    error: Error | null;
    totalCount: number;
    totalCountByType: Readonly<Record<ObjectType, number>>;
    hasNext: boolean;
}

export interface ICatalogFeedActions {
    next: () => Promise<void>;
    updateItem: (item: ICatalogItem) => void;
    removeItem: (item: ICatalogItemRef) => void;
    refetchObjectType: (type: ObjectType) => Promise<void>;
}

const CatalogFeedStateContext = createContext<ICatalogFeedState | null>(null);
const CatalogFeedActionsContext = createContext<ICatalogFeedActions | null>(null);

export type CatalogFeedProviderProps = PropsWithChildren<{
    backend: IAnalyticalBackend;
    workspace: string;
}>;

export function CatalogFeedProvider({ children, ...props }: CatalogFeedProviderProps) {
    const feed = useCatalogItemFeed(props);
    const {
        items,
        status,
        error,
        totalCount,
        totalCountByType,
        hasNext,
        next,
        updateItem,
        removeItem,
        refetchObjectType,
    } = feed;

    useObjectTypeCounterSync(totalCountByType);

    const state = useMemo<ICatalogFeedState>(
        () => ({
            items,
            status,
            error,
            totalCount,
            totalCountByType,
            hasNext,
        }),
        [items, status, error, totalCount, totalCountByType, hasNext],
    );

    const actions = useMemo<ICatalogFeedActions>(
        () => ({
            next,
            updateItem,
            removeItem,
            refetchObjectType,
        }),
        [next, updateItem, removeItem, refetchObjectType],
    );

    return (
        <CatalogFeedStateContext.Provider value={state}>
            <CatalogFeedActionsContext.Provider value={actions}>
                {children}
            </CatalogFeedActionsContext.Provider>
        </CatalogFeedStateContext.Provider>
    );
}

export function useCatalogFeedState(): ICatalogFeedState {
    const state = useContext(CatalogFeedStateContext);
    return getCatalogFeedContext(state, "useCatalogFeedState");
}

export function useCatalogFeedActions(): ICatalogFeedActions {
    const actions = useContext(CatalogFeedActionsContext);
    return getCatalogFeedContext(actions, "useCatalogFeedActions");
}

function getCatalogFeedContext<T>(value: T | null, hookName: string): T {
    if (!value) {
        throw new Error(`${hookName} must be used within CatalogFeedProvider`);
    }
    return value;
}
