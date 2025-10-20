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
import { useFullTextSearchState } from "../search/index.js";

export function useCatalogItemFeed({ backend, workspace, id, pageSize }: ICatalogItemFeedOptions) {
    const state = useFeedState();
    const cache = useFeedCache();
    const { searchTerm: search } = useFullTextSearchState();
    const { types, origin, createdBy, tags, qualityIds } = useFilterState();
    const { status, totalCount, totalCounts, error, items, setItems } = state;

    const queryOptions = useMemo<ICatalogItemQueryOptions>(() => {
        return {
            backend,
            workspace,
            search,
            origin,
            id: qualityIds.length > 0 ? [...qualityIds, ...(id ?? [])] : id,
            tags,
            createdBy,
            pageSize,
        };
    }, [backend, workspace, search, origin, id, createdBy, pageSize, tags, qualityIds]);
    const endpoints = useEndpoints(types, queryOptions);

    // reset
    useReset(state, cache, endpoints);

    // load first pages (cached)
    useFirstLoad(state, cache, endpoints);

    // total count by type calculation
    const totalCountByType = useMemo(
        () => getTotalCountByType(endpoints, totalCounts),
        [endpoints, totalCounts],
    );

    // cache update
    const updateItem = useUpdateItemCallback(cache.endpointItems, setItems);

    // Next page callback
    const { hasNext, next } = useNextCallback(state, cache, endpoints);

    return {
        items,
        error,
        status,
        totalCount,
        totalCountByType,
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
    const { initialized, endpointCache, endpointItems } = cache;
    const { setStatus, setError, setCurrentEndpoint, setTotalCounts, setItems } = state;

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
    }, [
        endpointCache,
        endpointItems,
        endpoints,
        initialized,
        setCurrentEndpoint,
        setError,
        setItems,
        setStatus,
        setTotalCounts,
    ]);
}

function useEndpoints(types: ObjectType[], queryOptions: ICatalogItemQueryOptions) {
    return useMemo(() => {
        if (queryOptions.id?.length === 0) {
            return [];
        }
        const promises = [];
        if (types.includes(ObjectTypes.DASHBOARD) || types.length === 0) {
            promises.push({
                query: () => getDashboardsQuery(queryOptions).query(),
                type: ObjectTypes.DASHBOARD,
            });
        }
        if (types.includes(ObjectTypes.VISUALIZATION) || types.length === 0) {
            promises.push({
                query: () => getInsightsQuery(queryOptions).query(),
                type: ObjectTypes.VISUALIZATION,
            });
        }
        if (types.includes(ObjectTypes.METRIC) || types.length === 0) {
            promises.push({ query: () => getMetricsQuery(queryOptions).query(), type: ObjectTypes.METRIC });
        }
        if (!queryOptions.createdBy?.length) {
            if (types.includes(ObjectTypes.ATTRIBUTE) || types.length === 0) {
                promises.push({
                    query: () => getAttributesQuery(queryOptions).query(),
                    type: ObjectTypes.ATTRIBUTE,
                });
            }
            if (types.includes(ObjectTypes.FACT) || types.length === 0) {
                promises.push({ query: () => getFactsQuery(queryOptions).query(), type: ObjectTypes.FACT });
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

    return {
        initialized,
        endpointCache,
        endpointItems,
    };
}

function useFeedState() {
    // State
    const [status, setStatus] = useState<AsyncStatus>("idle");
    const [error, setError] = useState<Error | null>(null);
    const [currentEndpoint, setCurrentEndpoint] = useState(0);
    const [totalCounts, setTotalCounts] = useState<number[]>([]);
    const [items, setItems] = useState<ICatalogItem[]>([]);

    // Derived state
    const totalCount = getTotalCount(totalCounts);

    return {
        status,
        setStatus,
        error,
        setError,
        currentEndpoint,
        setCurrentEndpoint,
        totalCounts,
        totalCount,
        setTotalCounts,
        items,
        setItems,
    };
}

function useFirstLoad(
    state: ReturnType<typeof useFeedState>,
    cache: ReturnType<typeof useFeedCache>,
    endpoints: ReturnType<typeof useEndpoints>,
) {
    const { setStatus, setError, setCurrentEndpoint, setTotalCounts, setItems } = state;
    const { initialized, endpointCache, endpointItems } = cache;
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
                const firstPages = await Promise.all(endpoints.map((ep) => ep.query()));

                if (!mounted) {
                    return;
                }

                // Set initial data for endpoints
                endpointCache.current = firstPages;
                endpointItems.current = firstPages.map((p) => p.items.map(convertEntityToCatalogItem));

                let currentEndpoint = firstPages.findIndex((page) => {
                    return page.items.length < page.totalCount;
                });
                currentEndpoint = currentEndpoint === -1 ? firstPages.length : currentEndpoint;

                setCurrentEndpoint(currentEndpoint);
                setItems(endpointItems.current.slice(0, currentEndpoint + 1).flat());
                setTotalCounts(firstPages.map((page) => page.totalCount));
                setStatus("success");
            } catch (error) {
                setError(error as Error);
                setItems([]);
                setTotalCounts([]);
                setStatus("error");
            }
        })();

        return () => {
            mounted = false;
        };
    }, [
        endpointCache,
        endpointItems,
        endpoints,
        initialized,
        setCurrentEndpoint,
        setError,
        setItems,
        setStatus,
        setTotalCounts,
    ]);
}

function useNextCallback(
    state: ReturnType<typeof useFeedState>,
    cache: ReturnType<typeof useFeedCache>,
    endpoints: ReturnType<typeof useEndpoints>,
) {
    const mounted = useMounted();
    const { status, totalCounts, setStatus, currentEndpoint, setCurrentEndpoint, setItems, setError } = state;
    const { endpointCache, endpointItems } = cache;

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
            const totalCount = totalCounts[idx] ?? 0;

            const current = endpointCache.current[idx];
            if (!current) {
                break;
            }

            if (items.length < totalCount) {
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
        totalCounts,
        hasNext,
        setStatus,
        setError,
        setCurrentEndpoint,
        setItems,
        endpointItems,
        endpointCache,
        endpoints.length,
    ]);

    return {
        next,
        hasNext,
    };
}

function getTotalCount(totalCounts: number[]) {
    return totalCounts.reduce((acc, count) => acc + count, 0);
}

function getTotalCountByType(endpoints: ReturnType<typeof useEndpoints>, totalCounts: number[]) {
    const base = {
        [ObjectTypes.DASHBOARD]: 0,
        [ObjectTypes.VISUALIZATION]: 0,
        [ObjectTypes.METRIC]: 0,
        [ObjectTypes.ATTRIBUTE]: 0,
        [ObjectTypes.FACT]: 0,
    };

    endpoints.forEach((endpoint, idx) => {
        base[endpoint.type] = totalCounts[idx] ?? 0;
    });

    return base;
}
