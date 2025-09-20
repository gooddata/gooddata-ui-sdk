// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type {
    IAttributesQueryResult,
    IDashboardsQueryResult,
    IFactsQueryResult,
    IInsightsQueryResult,
    IMeasuresQueryResult,
} from "@gooddata/sdk-backend-spi";

import { convertEntityToCatalogItem } from "./converter.js";
import {
    getAttributesQuery,
    getDashboardsQuery,
    getFactsQuery,
    getInsightsQuery,
    getMetricsQuery,
} from "./query.js";
import type { ICatalogItem, ICatalogItemFeedOptions, ICatalogItemQueryOptions } from "./types.js";
import { useUpdateItemCallback } from "./useUpdateItemCallback.js";
import type { AsyncStatus } from "../async/index.js";
import { useFilterState } from "../filter/index.js";
import { useMounted } from "../hooks/useMounted.js";
import { type ObjectType, ObjectTypes } from "../objectType/index.js";

export function useCatalogItemFeed({ backend, workspace, id, createdBy, pageSize }: ICatalogItemFeedOptions) {
    const state = useFeedState();
    const cache = useFeedCache();
    const { types, origin, tags } = useFilterState();
    const { status, totalCount, error, items, setItems } = state;

    const queryOptions = useMemo<ICatalogItemQueryOptions>(() => {
        return {
            backend,
            workspace,
            origin,
            id,
            tags,
            createdBy,
            pageSize,
        };
    }, [backend, workspace, origin, id, createdBy, pageSize, tags]);
    const endpoints = useEndpoints(types, queryOptions);

    // reset
    useReset(state, cache, endpoints);

    // load first pages (cached)
    useFirstLoad(state, cache, endpoints);

    // cache update
    const updateItem = useUpdateItemCallback(cache.endpointItems, setItems);

    // Next page callback
    const { hasNext, next } = useNextCallback(state, cache, endpoints);

    return {
        items,
        error,
        status,
        totalCount,
        hasNext,
        next,
        updateItem,
    };
}

function useReset(
    state: ReturnType<typeof useFeedState>,
    cache: ReturnType<typeof useFeedCache>,
    endpoints: ReturnType<typeof useEndpoints>,
) {
    const { initialized, endpointCache, endpointItems, endpointTotalCounts } = cache;
    const { setStatus, setError, setCurrentEndpoint, setTotal, setItems } = state;

    useLayoutEffect(() => {
        if (!initialized.current) {
            return;
        }

        initialized.current = false;
        endpointCache.current = [];
        endpointItems.current = [];
        endpointTotalCounts.current = [];

        setStatus("loading");
        setError(null);
        setCurrentEndpoint(0);
        setTotal(0);
        setItems([]);
    }, [
        endpointCache,
        endpointItems,
        endpointTotalCounts,
        endpoints,
        initialized,
        setCurrentEndpoint,
        setError,
        setItems,
        setStatus,
        setTotal,
    ]);
}

function useEndpoints(types: ObjectType[], queryOptions: ICatalogItemQueryOptions) {
    return useMemo(() => {
        if (queryOptions.id?.length === 0) {
            return [];
        }
        const promises = [];
        if (types.includes(ObjectTypes.DASHBOARD) || types.length === 0) {
            promises.push(() => getDashboardsQuery(queryOptions).query());
        }
        if (types.includes(ObjectTypes.VISUALIZATION) || types.length === 0) {
            promises.push(() => getInsightsQuery(queryOptions).query());
        }
        if (types.includes(ObjectTypes.METRIC) || types.length === 0) {
            promises.push(() => getMetricsQuery(queryOptions).query());
        }
        if (!queryOptions.createdBy?.length) {
            if (types.includes(ObjectTypes.ATTRIBUTE) || types.length === 0) {
                promises.push(() => getAttributesQuery(queryOptions).query());
            }
            if (types.includes(ObjectTypes.FACT) || types.length === 0) {
                promises.push(() => getFactsQuery(queryOptions).query());
            }
        }
        return promises;
    }, [queryOptions, types]);
}

function useFeedCache() {
    const endpointCache = useRef<
        (
            | IMeasuresQueryResult
            | IDashboardsQueryResult
            | IFactsQueryResult
            | IInsightsQueryResult
            | IAttributesQueryResult
        )[]
    >([]);
    const initialized = useRef(false);
    const endpointItems = useRef<ICatalogItem[][]>([]);
    const endpointTotalCounts = useRef<number[]>([]);

    return {
        initialized,
        endpointCache,
        endpointItems,
        endpointTotalCounts,
    };
}

function useFeedState() {
    const [status, setStatus] = useState<AsyncStatus>("idle");
    const [error, setError] = useState<Error | null>(null);
    const [currentEndpoint, setCurrentEndpoint] = useState(0);

    const [totalCount, setTotal] = useState(0);
    const [items, setItems] = useState<ICatalogItem[]>([]);

    return {
        status,
        setStatus,
        error,
        setError,
        currentEndpoint,
        setCurrentEndpoint,
        totalCount,
        setTotal,
        items,
        setItems,
    };
}

function useFirstLoad(
    state: ReturnType<typeof useFeedState>,
    cache: ReturnType<typeof useFeedCache>,
    endpoints: ReturnType<typeof useEndpoints>,
) {
    const { setStatus, setError, setCurrentEndpoint, setTotal, setItems } = state;
    const { initialized, endpointCache, endpointItems, endpointTotalCounts } = cache;
    // load first pages (cached)
    useEffect(() => {
        // prevent re-init
        if (initialized.current) {
            return;
        }
        initialized.current = true;

        setStatus("loading");
        setError(null);

        let mounted = true;
        (async () => {
            try {
                const firstPages = await Promise.all(endpoints.map((ep) => ep()));

                if (!mounted) {
                    return;
                }

                // Set initial data for endpoints
                endpointCache.current = firstPages;
                endpointItems.current = firstPages.map((p) => p.items.map(convertEntityToCatalogItem));
                endpointTotalCounts.current = firstPages.map((p) => p.totalCount);

                let currentEndpoint = firstPages.findIndex((page) => {
                    return page.items.length < page.totalCount;
                });
                currentEndpoint = currentEndpoint === -1 ? firstPages.length : currentEndpoint;

                setCurrentEndpoint(currentEndpoint);
                setItems(endpointItems.current.slice(0, currentEndpoint + 1).flat());
                setTotal(endpointTotalCounts.current.reduce((acc, c) => acc + c, 0));
                setStatus("success");
            } catch (error) {
                setError(error as Error);
                setItems([]);
                setTotal(0);
                setStatus("error");
            }
        })();

        return () => {
            mounted = false;
        };
    }, [
        endpointCache,
        endpointItems,
        endpointTotalCounts,
        endpoints,
        initialized,
        setCurrentEndpoint,
        setError,
        setItems,
        setStatus,
        setTotal,
    ]);
}

function useNextCallback(
    state: ReturnType<typeof useFeedState>,
    cache: ReturnType<typeof useFeedCache>,
    endpoints: ReturnType<typeof useEndpoints>,
) {
    const mounted = useMounted();
    const { status, setStatus, currentEndpoint, setCurrentEndpoint, setItems, setError } = state;
    const { endpointCache, endpointItems, endpointTotalCounts } = cache;

    // Check if there are more endpointItems to load
    const hasNext = useMemo(
        () => state.items.length < state.totalCount,
        [state.items.length, state.totalCount],
    );

    const next = useCallback(async () => {
        let idx = currentEndpoint;

        if (status !== "success" || !hasNext) {
            return;
        }

        setStatus("loadingMore");

        while (idx < endpoints.length) {
            const items = (endpointItems.current[idx] = endpointItems.current[idx] ?? []);
            const totalCounts = endpointTotalCounts.current[idx] ?? 0;

            const current = endpointCache.current[idx];
            if (!current) {
                break;
            }

            if (items.length < totalCounts) {
                try {
                    // load next page of this endpoint
                    const nextPage = await current.next();
                    endpointCache.current[idx] = nextPage;

                    // prevent updates if unmounted
                    if (!mounted.current) {
                        return;
                    }

                    let i = 0;
                    for (let o = nextPage.offset; o < nextPage.offset + nextPage.items.length; o++) {
                        items[o] = convertEntityToCatalogItem(nextPage.items[i++]);
                    }

                    setItems(endpointItems.current.slice(0, currentEndpoint + 1).flat());
                    setCurrentEndpoint(idx);
                    setStatus("success");
                    setError(null);
                } catch (error) {
                    setStatus("error");
                    setError(error as Error);
                }
                return;
            }

            idx++;
        }

        setStatus("success");
        setCurrentEndpoint(idx); // finished last endpoint
        setItems(endpointItems.current.slice(0, currentEndpoint + 1).flat());
    }, [
        mounted,
        currentEndpoint,
        status,
        hasNext,
        setStatus,
        setError,
        setCurrentEndpoint,
        setItems,
        endpointItems,
        endpointTotalCounts,
        endpointCache,
        endpoints.length,
    ]);

    return {
        next,
        hasNext,
    };
}
