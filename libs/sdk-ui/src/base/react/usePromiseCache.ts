// (C) 2007-2020 GoodData Corporation
import { useMemo } from "react";
import { PromiseCache } from "./PromiseCache";

/**
 * Hook that returns local component PromiseCache
 * @internal
 */
export function usePromiseCache<P, T>(
    promiseFactory: (params: P) => Promise<T>,
    getCacheKey?: (params: P) => string,
) {
    const promiseCache = useMemo(() => new PromiseCache(promiseFactory, getCacheKey), []);
    return promiseCache;
}
