// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type {
    IAttributesQueryResult,
    IDashboardsQueryResult,
    IDatasetsQueryResult,
    IFactsQueryResult,
    IInsightsQueryResult,
    IMeasuresQueryResult,
    IParametersQueryResult,
} from "@gooddata/sdk-backend-spi";

import { type AsyncStatus } from "../async/types.js";
import { useFilterState, useQualityFilter } from "../filter/FilterContext.js";
import { useMounted } from "../hooks/useMounted.js";
import { ObjectTypes } from "../objectType/constants.js";
import { type ObjectType } from "../objectType/types.js";
import { useIsParametersEnabled } from "../parameter/gate.js";
import { useFullTextSearchState } from "../search/FullTextSearchContext.js";
import { convertEntityToCatalogItem } from "./converter.js";
import {
    getAttributesQuery,
    getDashboardsQuery,
    getDateDatasetsQuery,
    getFactsQuery,
    getInsightsQuery,
    getMetricsQuery,
    getParametersQuery,
} from "./query.js";
import type { ICatalogItem, ICatalogItemFeedOptions, ICatalogItemQueryOptions } from "./types.js";
import { useCatalogItemRemoveCallback, useCatalogItemUpdateCallback } from "./useCatalogItemMutations.js";

type FeedEndpoint = {
    type: ObjectType;
    query: () => Promise<EndpointResult>;
};

type EndpointResult =
    | IMeasuresQueryResult
    | IDashboardsQueryResult
    | IFactsQueryResult
    | IInsightsQueryResult
    | IAttributesQueryResult
    | IDatasetsQueryResult
    | IParametersQueryResult;

export function useCatalogItemFeed({ backend, workspace, id, pageSize }: ICatalogItemFeedOptions) {
    const state = useFeedState();
    const cache = useFeedCache();
    const { searchTerm: search } = useFullTextSearchState();
    const { types, origin, createdBy, tags, isHidden, certification } = useFilterState();
    const qualityIds = useQualityFilter();
    const isParametersEnabled = useIsParametersEnabled();
    const { status, totalCount, totalCounts, error, items, setItems, setTotalCounts } = state;

    const queryOptions = useMemo<ICatalogItemQueryOptions>(() => {
        let includeIds: string[] | undefined = id;
        let excludeIds: string[] | undefined = undefined;

        if (qualityIds) {
            if (qualityIds.isInverted) {
                excludeIds = qualityIds.values;
            } else {
                includeIds = [...new Set([...qualityIds.values, ...(id ?? [])])];
            }
        }

        return {
            backend,
            workspace,
            search,
            origin,
            id: includeIds,
            excludeId: excludeIds,
            createdBy: createdBy.isInverted ? undefined : createdBy.values,
            excludeCreatedBy: createdBy.isInverted ? createdBy.values : undefined,
            tags: tags.isInverted ? undefined : tags.values,
            excludeTags: tags.isInverted ? tags.values : undefined,
            isHidden,
            certification,
            pageSize,
        };
    }, [
        backend,
        workspace,
        search,
        origin,
        id,
        createdBy,
        pageSize,
        tags,
        qualityIds,
        isHidden,
        certification,
    ]);
    const endpoints = useEndpoints(types, queryOptions, isParametersEnabled);

    // reset
    useReset(state, cache, endpoints);

    // load first pages (cached)
    useFirstLoad(state, cache, endpoints);

    // refetch particular object type
    const refetchObjectType = useObjectTypeRefetch(state, cache, endpoints);

    // total count by type calculation
    const totalCountByType = useMemo(
        () => getTotalCountByType(endpoints, totalCounts),
        [endpoints, totalCounts],
    );

    // cache update
    const updateItem = useCatalogItemUpdateCallback(cache.endpointItems, setItems);
    const removeItem = useCatalogItemRemoveCallback(cache.endpointItems, setItems, setTotalCounts);

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
        removeItem,
        refetchObjectType,
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

function useEndpoints(
    types: ObjectType[],
    queryOptions: ICatalogItemQueryOptions,
    isParametersEnabled: boolean,
): FeedEndpoint[] {
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
        if (isParametersEnabled && (types.includes(ObjectTypes.PARAMETER) || types.length === 0)) {
            promises.push({
                query: () => getParametersQuery(queryOptions).query(),
                type: ObjectTypes.PARAMETER,
            });
        }
        if (
            !queryOptions.createdBy?.length &&
            !queryOptions.excludeCreatedBy?.length &&
            !queryOptions.certification
        ) {
            if (types.includes(ObjectTypes.ATTRIBUTE) || types.length === 0) {
                promises.push({
                    query: () => getAttributesQuery(queryOptions).query(),
                    type: ObjectTypes.ATTRIBUTE,
                });
            }
            if (types.includes(ObjectTypes.FACT) || types.length === 0) {
                promises.push({ query: () => getFactsQuery(queryOptions).query(), type: ObjectTypes.FACT });
            }
            if (types.includes(ObjectTypes.DATASET) || types.length === 0) {
                promises.push({
                    query: () => getDateDatasetsQuery(queryOptions).query(),
                    type: ObjectTypes.DATASET,
                });
            }
        }
        return promises;
    }, [isParametersEnabled, queryOptions, types]);
}

function useFeedCache() {
    const endpointCache = useRef<EndpointResult[]>([]);
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
        void (async () => {
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
                setItems(getItemsThroughEndpoint(endpointItems.current, currentEndpoint));
                setTotalCounts(firstPages.map((page) => page.totalCount));
                setStatus("success");
            } catch (error) {
                console.error(error);
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
    const hasNext = state.items.length < state.totalCount;

    const nextRef = useRef(async () => {});
    nextRef.current = async () => {
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

                    setItems(getItemsThroughEndpoint(endpointItems.current, idx));
                    setCurrentEndpoint(idx);
                    setStatus("success");
                    setError(null);
                } catch (error) {
                    console.error(error);
                    setStatus("error");
                    setError(error as Error);
                }
                return;
            }

            idx++;
        }

        setStatus("success");
        setCurrentEndpoint(idx); // finished last endpoint
        setItems(getItemsThroughEndpoint(endpointItems.current, idx));
    };

    const next = useCallback(() => nextRef.current(), []);

    return {
        next,
        hasNext,
    };
}

function useObjectTypeRefetch(
    state: ReturnType<typeof useFeedState>,
    cache: ReturnType<typeof useFeedCache>,
    endpoints: ReturnType<typeof useEndpoints>,
) {
    const mounted = useMounted();
    const { initialized, endpointCache, endpointItems } = cache;
    const { currentEndpoint, setCurrentEndpoint, setItems, setTotalCounts, setError } = state;

    const refetchRef = useRef(async (_type: ObjectType) => {});
    refetchRef.current = async (type: ObjectType) => {
        if (!initialized.current) {
            return;
        }

        const endpointIndex = endpoints.findIndex((endpoint) => endpoint.type === type);
        if (endpointIndex === -1) {
            return;
        }

        try {
            const refreshedEndpoint = await queryRefreshedEndpoint(
                endpoints[endpointIndex],
                endpointItems.current[endpointIndex]?.length ?? 0,
            );

            if (!mounted.current) {
                return;
            }

            endpointCache.current[endpointIndex] = refreshedEndpoint.page;
            endpointItems.current[endpointIndex] = refreshedEndpoint.items;

            const nextCurrentEndpoint =
                endpointIndex < currentEndpoint &&
                refreshedEndpoint.items.length < refreshedEndpoint.page.totalCount
                    ? endpointIndex
                    : currentEndpoint;

            setCurrentEndpoint(nextCurrentEndpoint);
            setItems(getItemsThroughEndpoint(endpointItems.current, nextCurrentEndpoint));
            setTotalCounts((currentCounts) => {
                const nextCounts = [...currentCounts];
                nextCounts[endpointIndex] = refreshedEndpoint.page.totalCount;
                return nextCounts;
            });
            setError(null);
        } catch (error) {
            // Refetch failure should not affect other operations, using console.error instead of throwing
            console.error(error);
        }
    };

    return useCallback((type: ObjectType) => refetchRef.current(type), []);
}

async function queryRefreshedEndpoint(endpoint: FeedEndpoint, loadedItemCount: number) {
    let page = await endpoint.query();
    const items: ICatalogItem[] = [];
    mergeEndpointPageItems(items, page);

    const targetItemCount = Math.min(Math.max(loadedItemCount, page.items.length), page.totalCount);

    while (items.length < targetItemCount) {
        page = await page.next();
        mergeEndpointPageItems(items, page);
    }

    return { page, items };
}

function getTotalCount(totalCounts: number[]) {
    return totalCounts.reduce((acc, count) => acc + count, 0);
}

function getItemsThroughEndpoint(endpointItems: ICatalogItem[][], currentEndpoint: number) {
    return endpointItems.slice(0, currentEndpoint + 1).flat();
}

function mergeEndpointPageItems(items: ICatalogItem[], page: EndpointResult) {
    page.items.forEach((item, index) => {
        items[page.offset + index] = convertEntityToCatalogItem(item);
    });
}

function getTotalCountByType(endpoints: ReturnType<typeof useEndpoints>, totalCounts: number[]) {
    const base = {
        [ObjectTypes.DASHBOARD]: 0,
        [ObjectTypes.VISUALIZATION]: 0,
        [ObjectTypes.METRIC]: 0,
        [ObjectTypes.ATTRIBUTE]: 0,
        [ObjectTypes.FACT]: 0,
        [ObjectTypes.DATASET]: 0,
        [ObjectTypes.PARAMETER]: 0,
    };

    endpoints.forEach((endpoint, idx) => {
        base[endpoint.type] = totalCounts[idx] ?? 0;
    });

    return base;
}
