// (C) 2007-2020 GoodData Corporation
import { useState } from "react";
import { IPagedResource } from "@gooddata/sdk-backend-spi";
import { usePromiseCache } from "./usePromiseCache";

/**
 * @internal
 */
interface IUsePagedResourceState<T> {
    totalItemsCount: number;
    items: Array<T | undefined>;
}

/**
 * Hook for loading and caching paged resource
 * @public
 */
export function usePagedResource<T, TItem>(
    loadPagedResource: (params: T) => Promise<IPagedResource<TItem>>,
    getCacheKey?: (params: T) => string,
) {
    const promiseCache = usePromiseCache(loadPagedResource, getCacheKey);
    const [state, setState] = useState<IUsePagedResourceState<TItem>>({
        totalItemsCount: undefined,
        items: [],
    });

    const mergeResourceResult = (result: IPagedResource<TItem>) => {
        setState(state => {
            const isFirstLoad = typeof state.totalItemsCount === "undefined";
            const items = isFirstLoad ? new Array(result.totalCount) : [...state.items];

            items.splice(result.offset, result.limit, ...result.items);

            return {
                totalItemsCount: result.totalCount,
                items,
            };
        });
    };

    const reset = () => {
        promiseCache.reset();
        setState({
            items: [],
            totalItemsCount: undefined,
        });
    };

    const load = (params: T) => {
        if (promiseCache.getResult(params)) {
            return;
        }
        promiseCache
            .load(params)
            .then(mergeResourceResult)
            .catch();
    };

    const { items, totalItemsCount } = state;

    return {
        load,
        reset,
        items,
        totalItemsCount,
    };
}
