// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type UseCancelablePromiseState,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { convertTrendingObjectToCatalogItem } from "../catalogItem/converter.js";
import type { ICatalogItem } from "../catalogItem/types.js";

const TRENDING_PAGE_SIZE = 5;

async function fetchTrendingItems(backend: IAnalyticalBackend, workspace: string): Promise<ICatalogItem[]> {
    const response = await backend.workspace(workspace).genAI().getAnalyticsCatalog().getTrendingObjects();

    return response.objects
        .filter((obj) => Boolean(obj.id))
        .slice(0, TRENDING_PAGE_SIZE)
        .map(convertTrendingObjectToCatalogItem);
}

export function useTrendingItems(): UseCancelablePromiseState<ICatalogItem[], Error> {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return useCancelablePromise<ICatalogItem[], Error>(
        {
            promise: () => fetchTrendingItems(backend, workspace),
            onError: (error) => console.error(error),
        },
        [backend, workspace],
    );
}
