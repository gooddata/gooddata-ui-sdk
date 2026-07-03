// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type GenAIObjectType } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { useSemanticSearch } from "@gooddata/sdk-ui-semantic-search";

import { type AsyncStatus } from "../async/types.js";
import { mapGenAIObjectType } from "../objectType/mapping.js";
import type { ObjectType } from "../objectType/types.js";
import { useFeatureFlags } from "../permission/PermissionsContext.js";

import { convertEntityToCatalogItem } from "./converter.js";
import { type ICatalogItem, type ICatalogItemSemanticSearchOptions } from "./types.js";
import { useCatalogEndpoints } from "./useCatalogEndpoints.js";

export function useCatalogItemSemanticSearch({
    queryOptions,
    items,
    status,
    types,
    search,
}: ICatalogItemSemanticSearchOptions) {
    const flags = useFeatureFlags();

    const objectTypes = useMemo(() => convertTypesToGenAiTypes(types), [types]);
    const isSemanticSearchEnabled = Boolean(flags?.enableCatalogSmartSearchResults);
    const isSemanticSearchPossible =
        isSemanticSearchEnabled && objectTypes.length && search && !queryOptions.id;
    const { searchStatus, searchResults } = useSemanticSearch({
        searchTerm: isSemanticSearchPossible ? search : "",
        backend: queryOptions.backend,
        workspace: queryOptions.workspace,
        objectTypes,
    });

    const updateQueryOptions = useMemo(() => {
        return {
            ...queryOptions,
            id: searchResults.map((item) => item.id),
            search: undefined,
        };
    }, [queryOptions, searchResults]);
    const endpoints = useCatalogEndpoints(types, updateQueryOptions, flags);

    const { status: promiseStatus, result: promiseItems } = useCancelablePromise(
        {
            promise: async () => {
                if (!isSemanticSearchEnabled || searchStatus !== "success") {
                    return [];
                }

                const firstPages = await Promise.all(endpoints.map((ep) => ep.query()));

                const searchResultIds = searchResults.map((res) => res.id);
                return firstPages
                    .reduce<ICatalogItem[]>((items, page) => {
                        return [...items, ...page.items.map(convertEntityToCatalogItem)];
                    }, [])
                    .sort((a, b) => {
                        return searchResultIds.indexOf(a.identifier) - searchResultIds.indexOf(b.identifier);
                    });
            },
            onError: (err) => {
                console.error(err);
            },
        },
        [isSemanticSearchEnabled, searchStatus, endpoints, searchResults],
    );

    const relatedItemsStatus = getRelatedItemsStatus(isSemanticSearchEnabled, searchStatus, promiseStatus);
    const relatedHasNext = isSemanticSearchEnabled && relatedItemsStatus === "loading";
    const isLoading = status === "loading" || status === "idle" || relatedHasNext;

    const relatedItems = useMemo(() => {
        if (isLoading) {
            return [];
        }
        return (promiseItems ?? []).filter(
            (relatedItem) => !items.some((item) => areCatalogItemsEqual(item, relatedItem)),
        );
    }, [promiseItems, isLoading, items]);

    return {
        relatedItems,
        relatedItemsStatus,
        relatedHasNext,
    };
}

function convertTypesToGenAiTypes(types: ObjectType[]): GenAIObjectType[] {
    if (!types.length) {
        return ["fact", "attribute", "dashboard", "metric", "visualization", "dataset", "date"];
    }
    return types
        .map((a) => {
            if (a === "parameter") {
                return null;
            }
            return mapGenAIObjectType(a);
        })
        .filter(Boolean) as GenAIObjectType[];
}

function areCatalogItemsEqual(a: ICatalogItem, b: ICatalogItem): boolean {
    return a.identifier === b.identifier && a.type === b.type;
}

function getRelatedItemsStatus(
    isSemanticSearchEnabled: boolean,
    searchStatus: AsyncStatus,
    promiseStatus: ReturnType<typeof useCancelablePromise>["status"],
): AsyncStatus {
    if (!isSemanticSearchEnabled) {
        return "idle";
    }
    if (searchStatus === "loading" || (searchStatus === "success" && promiseStatus === "loading")) {
        return "loading";
    }
    if (searchStatus === "error" || promiseStatus === "error") {
        return "error";
    }
    if (searchStatus === "success" && promiseStatus === "success") {
        return "success";
    }
    return "idle";
}
