// (C) 2025 GoodData Corporation

import { useRef } from "react";

/**
 * A hook that provides deep memoization using JSON.stringify for content comparison.
 * Each instance maintains its own cache, preventing interference between multiple hook usages.
 *
 * @internal
 */
export function useDeepMemo() {
    const memoCache = useRef(new Map<string, any>());

    /**
     * Memoizes a value by its stringified content, not by reference.
     * Returns the same object reference if the content hasn't changed.
     *
     * @param key - Unique identifier for this value type
     * @param value - The value to memoize
     * @returns The memoized value with stable reference
     */
    function memoize<T>(key: string, value: T): T {
        const valueKey = JSON.stringify(value);
        const cacheKey = `${key}:${valueKey}`;

        if (memoCache.current.has(cacheKey)) {
            return memoCache.current.get(cacheKey);
        }

        memoCache.current.set(cacheKey, value);
        return value;
    }

    return memoize;
}
