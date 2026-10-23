// (C) 2021-2026 GoodData Corporation

import { type DependencyList, type MutableRefObject, type Ref, useImperativeHandle, useMemo } from "react";

export function useApi<T>(ref: Ref<T> | undefined, api: T, deps?: DependencyList): void {
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    const memoizedApi = useMemo(() => api, deps || []);

    useImperativeHandle(ref, () => memoizedApi, [memoizedApi]);
}

export function handler<A, R, G>(
    api: MutableRefObject<A | undefined | null>,
    fn: (api: A, ...args: G[]) => R,
): () => R | Promise<void> {
    return (...args: G[]) => {
        if (api.current) {
            return fn(api.current, ...args);
        }
        return Promise.resolve();
    };
}
