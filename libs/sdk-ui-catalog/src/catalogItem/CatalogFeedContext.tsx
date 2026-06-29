// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type AsyncStatus } from "../async/types.js";
import type { ObjectType } from "../objectType/types.js";

import type { ICatalogItem, ICatalogItemRef } from "./types.js";
import { useCatalogItemFeed } from "./useCatalogItemFeed.js";

export interface ICatalogFeedState {
    items: ICatalogItem[];
    status: AsyncStatus;
    relatedItems: ICatalogItem[];
    relatedItemsStatus: AsyncStatus;
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
const CatalogFeedCounterContext = createContext<Readonly<Record<ObjectType, number>> | null>(null);

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
        relatedItems,
        relatedItemsStatus,
        next,
        updateItem,
        removeItem,
        refetchObjectType,
    } = feed;

    const state = useMemo<ICatalogFeedState>(
        () => ({
            items,
            status,
            relatedItems,
            relatedItemsStatus,
            error,
            totalCount,
            totalCountByType,
            hasNext,
        }),
        [items, status, relatedItems, relatedItemsStatus, error, totalCount, totalCountByType, hasNext],
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
            <CatalogFeedCounterContext.Provider value={totalCountByType}>
                <CatalogFeedActionsContext.Provider value={actions}>
                    {children}
                </CatalogFeedActionsContext.Provider>
            </CatalogFeedCounterContext.Provider>
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

export function useCatalogFeedCounter(): Readonly<Record<ObjectType, number>> {
    const counter = useContext(CatalogFeedCounterContext);
    return getCatalogFeedContext(counter, "useCatalogFeedCounter");
}

function getCatalogFeedContext<T>(value: T | null, hookName: string): T {
    if (!value) {
        throw new Error(`${hookName} must be used within CatalogFeedProvider`);
    }
    return value;
}
