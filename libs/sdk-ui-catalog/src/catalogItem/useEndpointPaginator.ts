// (C) 2026 GoodData Corporation

// Type parameterization choice:
// The paginator is parameterized over a common page shape `IPaginatorPage<TEntity>`
// (`items` / `offset` / `totalCount` / `next`) plus a `convert: (entity) => TItem`
// callback supplied by the caller. The full backend `IPagedResource<T>` union
// is structurally assignable to this shape, so callers (e.g. `useCatalogItemFeed`)
// keep `convertEntityToCatalogItem` in the composition root rather than pushing
// catalog-domain types into this hook.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { type AsyncStatus } from "../async/types.js";
import { useMounted } from "../hooks/useMounted.js";

export interface IPaginatorPage<TEntity> {
    readonly items: readonly TEntity[];
    readonly offset: number;
    readonly totalCount: number;
    next(): Promise<IPaginatorPage<TEntity>>;
}

export interface IPaginatorEndpoint<TEntity> {
    query(): Promise<IPaginatorPage<TEntity>>;
}

export interface IEndpointPaginator<TItem> {
    items: TItem[];
    status: AsyncStatus;
    error: Error | null;
    totalCount: number;
    totalCounts: number[];
    hasNext: boolean;
    next: () => Promise<void>;
    refetch: (index: number) => Promise<void>;
    updateWhere: (predicate: (item: TItem) => boolean, replacement: TItem) => void;
    removeWhere: (predicate: (item: TItem) => boolean) => void;
}

export function useEndpointPaginator<TEntity, TItem>(
    endpoints: ReadonlyArray<IPaginatorEndpoint<TEntity>>,
    convert: (entity: TEntity) => TItem,
): IEndpointPaginator<TItem> {
    const mounted = useMounted();
    const convertRef = useRef(convert);
    convertRef.current = convert;

    const [status, setStatus] = useState<AsyncStatus>("idle");
    const [error, setError] = useState<Error | null>(null);
    const [currentEndpoint, setCurrentEndpoint] = useState(0);
    const [totalCounts, setTotalCounts] = useState<number[]>([]);
    const [items, setItems] = useState<TItem[]>([]);

    const endpointCache = useRef<IPaginatorPage<TEntity>[]>([]);
    const endpointItems = useRef<TItem[][]>([]);
    const initialized = useRef(false);

    // Reset whenever the endpoints array changes. useLayoutEffect runs before
    // the matching useEffect, so any reset is observed by callers before the
    // first-load effect kicks off the new round of queries.
    useLayoutEffect(() => {
        if (!initialized.current) {
            return;
        }
        initialized.current = false;
        endpointCache.current = [];
        endpointItems.current = [];

        setStatus("loading");
        setError(null);
        setCurrentEndpoint(0);
        setTotalCounts([]);
        setItems([]);
    }, [endpoints]);

    // First-load effect: in parallel, query the first page of every endpoint.
    useEffect(() => {
        if (initialized.current) {
            return;
        }
        initialized.current = true;

        setStatus("loading");
        setError(null);

        let active = true;
        void (async () => {
            try {
                const firstPages = await Promise.all(endpoints.map((ep) => ep.query()));
                if (!active) {
                    return;
                }

                endpointCache.current = firstPages;
                endpointItems.current = firstPages.map((page) =>
                    page.items.map((entity) => convertRef.current(entity)),
                );

                let cursor = firstPages.findIndex((page) => page.items.length < page.totalCount);
                cursor = cursor === -1 ? firstPages.length : cursor;

                setCurrentEndpoint(cursor);
                setItems(getItemsThroughEndpoint(endpointItems.current, cursor));
                setTotalCounts(firstPages.map((page) => page.totalCount));
                setStatus("success");
            } catch (loadError) {
                console.error(loadError);
                if (!active) {
                    return;
                }
                setError(loadError as Error);
                setItems([]);
                setTotalCounts([]);
                setStatus("error");
            }
        })();

        return () => {
            active = false;
        };
    }, [endpoints]);

    const totalCount = totalCounts.reduce((acc, count) => acc + count, 0);
    const hasNext = items.length < totalCount;

    const nextRef = useRef(async () => {});
    nextRef.current = async () => {
        let idx = currentEndpoint;
        if (status !== "success" || !hasNext) {
            return;
        }
        setStatus("loadingMore");

        while (idx < endpoints.length) {
            const itemsForEndpoint = (endpointItems.current[idx] = endpointItems.current[idx] ?? []);
            const totalForEndpoint = totalCounts[idx] ?? 0;
            const cached = endpointCache.current[idx];
            if (!cached) {
                break;
            }

            if (itemsForEndpoint.length < totalForEndpoint) {
                try {
                    const nextPage = await cached.next();
                    endpointCache.current[idx] = nextPage;

                    if (!mounted.current) {
                        return;
                    }

                    let i = 0;
                    for (let o = nextPage.offset; o < nextPage.offset + nextPage.items.length; o++) {
                        itemsForEndpoint[o] = convertRef.current(nextPage.items[i++]);
                    }

                    setItems(getItemsThroughEndpoint(endpointItems.current, idx));
                    setCurrentEndpoint(idx);
                    setStatus("success");
                    setError(null);
                } catch (nextError) {
                    console.error(nextError);
                    if (!mounted.current) {
                        return;
                    }
                    setStatus("error");
                    setError(nextError as Error);
                }
                return;
            }

            idx++;
        }

        setStatus("success");
        setCurrentEndpoint(idx);
        setItems(getItemsThroughEndpoint(endpointItems.current, idx));
    };

    const next = useCallback(() => nextRef.current(), []);

    const refetchRef = useRef(async (_index: number) => {});
    refetchRef.current = async (index: number) => {
        if (!initialized.current) {
            return;
        }
        if (index < 0 || index >= endpoints.length) {
            return;
        }
        const endpoint = endpoints[index];
        if (!endpoint) {
            return;
        }

        try {
            const previousDepth = endpointItems.current[index]?.length ?? 0;
            const refreshed = await queryRefreshedEndpoint<TEntity, TItem>(
                endpoint,
                previousDepth,
                convertRef.current,
            );

            if (!mounted.current) {
                return;
            }

            endpointCache.current[index] = refreshed.page;
            endpointItems.current[index] = refreshed.items;

            const stillIncomplete = refreshed.items.length < refreshed.page.totalCount;
            const nextCursor = index < currentEndpoint && stillIncomplete ? index : currentEndpoint;

            setCurrentEndpoint(nextCursor);
            setItems(getItemsThroughEndpoint(endpointItems.current, nextCursor));
            setTotalCounts((current) => {
                const updated = [...current];
                updated[index] = refreshed.page.totalCount;
                return updated;
            });
            setError(null);
        } catch (refetchError) {
            // Refetch failure is non-fatal: log and leave existing state intact.
            console.error(refetchError);
        }
    };

    const refetch = useCallback((index: number) => refetchRef.current(index), []);

    const updateWhere = useCallback((predicate: (item: TItem) => boolean, replacement: TItem) => {
        let matched = false;
        endpointItems.current.forEach((bucket) => {
            bucket.forEach((item, idx) => {
                if (predicate(item)) {
                    bucket[idx] = replacement;
                    matched = true;
                }
            });
        });
        if (!matched) {
            return;
        }
        setItems((current) => current.map((item) => (predicate(item) ? replacement : item)));
    }, []);

    const removeWhere = useCallback((predicate: (item: TItem) => boolean) => {
        const removedByEndpoint = new Map<number, number>();
        endpointItems.current.forEach((bucket, endpointIndex) => {
            for (let i = bucket.length - 1; i >= 0; i -= 1) {
                if (predicate(bucket[i])) {
                    bucket.splice(i, 1);
                    removedByEndpoint.set(endpointIndex, (removedByEndpoint.get(endpointIndex) ?? 0) + 1);
                }
            }
        });
        if (removedByEndpoint.size === 0) {
            return;
        }
        setItems((current) => current.filter((item) => !predicate(item)));
        setTotalCounts((counts) => counts.map((count, index) => count - (removedByEndpoint.get(index) ?? 0)));
    }, []);

    return {
        items,
        status,
        error,
        totalCount,
        totalCounts,
        hasNext,
        next,
        refetch,
        updateWhere,
        removeWhere,
    };
}

async function queryRefreshedEndpoint<TEntity, TItem>(
    endpoint: IPaginatorEndpoint<TEntity>,
    previousDepth: number,
    convert: (entity: TEntity) => TItem,
) {
    let page = await endpoint.query();
    const items: TItem[] = [];
    mergeEndpointPageItems(items, page, convert);

    const targetDepth = Math.min(Math.max(previousDepth, page.items.length), page.totalCount);
    while (items.length < targetDepth) {
        page = await page.next();
        mergeEndpointPageItems(items, page, convert);
    }

    return { page, items };
}

function mergeEndpointPageItems<TEntity, TItem>(
    items: TItem[],
    page: IPaginatorPage<TEntity>,
    convert: (entity: TEntity) => TItem,
) {
    page.items.forEach((entity, index) => {
        items[page.offset + index] = convert(entity);
    });
}

function getItemsThroughEndpoint<TItem>(endpointItems: TItem[][], cursor: number) {
    return endpointItems.slice(0, cursor + 1).flat();
}
