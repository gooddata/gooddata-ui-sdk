// (C) 2007-2021 GoodData Corporation
import { useState, useEffect } from "react";
import { IPagedResource } from "@gooddata/sdk-backend-spi";
import { usePromiseCache } from "./usePromiseCache.js";

/**
 * @public
 */
export interface IUsePagedResourceState<TItem> {
    totalItemsCount: number | undefined;
    items: Array<TItem | undefined>;
}

/**
 * @public
 */
export interface IUsePagedResourceResult<TItem> extends IUsePagedResourceState<TItem> {
    isLoading: boolean;
}

/**
 * Hook for getting data from paged resource
 * @public
 */
export function usePagedResource<TParams, TItem>(
    resourceFactory: (params: TParams) => Promise<IPagedResource<TItem>>,
    fetchParams: TParams[],
    fetchDeps: React.DependencyList,
    resetDeps: React.DependencyList,
    getCacheKey?: (params: TParams) => string,
    initialState: IUsePagedResourceState<TItem> = {
        totalItemsCount: undefined,
        items: [],
    },
): IUsePagedResourceResult<TItem> {
    const [state, setState] = useState<IUsePagedResourceState<TItem>>(initialState);

    const reset = () => setState(initialState);

    const mergeResult = (result: IPagedResource<TItem>) =>
        setState((state) => {
            const isFirstResult = typeof state.totalItemsCount === "undefined";
            const items = isFirstResult ? new Array(result.totalCount) : [...state.items];

            items.splice(result.offset, result.limit, ...result.items);

            return {
                totalItemsCount: result.totalCount,
                items,
            };
        });

    const { isLoading, results } = usePromiseCache(
        resourceFactory,
        fetchParams,
        fetchDeps,
        resetDeps,
        getCacheKey,
    );

    useEffect(() => {
        // We want to reset state only after resetDeps are changed, not on first run
        return () => {
            reset();
        };
    }, resetDeps);

    useEffect(() => {
        results.forEach(mergeResult);
    }, [results]);

    const { items, totalItemsCount } = state;

    return {
        isLoading,
        items,
        totalItemsCount,
    };
}
