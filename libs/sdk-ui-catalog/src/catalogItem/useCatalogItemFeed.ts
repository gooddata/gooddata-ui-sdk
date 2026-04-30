// (C) 2025-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { useFilterState, useQualityFilter } from "../filter/FilterContext.js";
import { ObjectTypes } from "../objectType/constants.js";
import { type ObjectType } from "../objectType/types.js";
import { useFeatureFlags } from "../permission/PermissionsContext.js";
import { useFullTextSearchState } from "../search/FullTextSearchContext.js";
import { convertEntityToCatalogItem } from "./converter.js";
import type { ICatalogItem, ICatalogItemFeedOptions, ICatalogItemRef } from "./types.js";
import { type FeedEndpoint, useCatalogEndpoints, useCatalogQueryOptions } from "./useCatalogEndpoints.js";
import { useEndpointPaginator } from "./useEndpointPaginator.js";

export function useCatalogItemFeed(feedOptions: ICatalogItemFeedOptions) {
    const { searchTerm: search } = useFullTextSearchState();
    const { types, origin, createdBy, tags, isHidden, certification } = useFilterState();
    const qualityIds = useQualityFilter();
    const flags = useFeatureFlags();

    const queryOptions = useCatalogQueryOptions(feedOptions, {
        search,
        origin,
        createdBy,
        tags,
        qualityIds,
        isHidden,
        certification,
    });
    const endpoints = useCatalogEndpoints(types, queryOptions, flags);

    const paginator = useEndpointPaginator(endpoints, convertEntityToCatalogItem);
    const {
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
    } = paginator;

    const totalCountByType = useMemo(
        () => getTotalCountByType(endpoints, totalCounts),
        [endpoints, totalCounts],
    );

    const refetchObjectType = useCallback(
        (type: ObjectType) => {
            const index = endpoints.findIndex((endpoint) => endpoint.type === type);
            return index === -1 ? Promise.resolve() : refetch(index);
        },
        [endpoints, refetch],
    );

    const updateItem = useCallback(
        (item: ICatalogItem) => updateWhere((existing) => areObjRefsEqual(existing, item), item),
        [updateWhere],
    );
    const removeItem = useCallback(
        (item: ICatalogItemRef) => removeWhere((existing) => areObjRefsEqual(existing, item)),
        [removeWhere],
    );

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

function getTotalCountByType(endpoints: FeedEndpoint[], totalCounts: number[]) {
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
