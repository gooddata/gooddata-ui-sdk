// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type UseCancelablePromiseState,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { convertEntityToCatalogItem } from "../catalogItem/converter.js";
import { getDashboardsQuery, getInsightsQuery, getMetricsQuery } from "../catalogItem/query.js";
import type { ICatalogItem } from "../catalogItem/types.js";
import { usePermissionsState } from "../permission/PermissionsContext.js";

const RECOMMENDED_PAGE_SIZE = 5;

async function fetchRecommendedItems(
    backend: IAnalyticalBackend,
    workspace: string,
    userId: string,
    organizationId: string,
): Promise<ICatalogItem[]> {
    // User group names are used as tags to find recommended catalog items --
    // items tagged with a group name are surfaced to members of that group.
    const groups = await backend.organization(organizationId).users().getUserGroupsOfUser(userId);

    const tags = groups.map((g) => g.name).filter((name): name is string => Boolean(name));

    if (tags.length === 0) {
        return [];
    }

    const queryOptions = {
        backend,
        workspace,
        origin: "ALL" as const,
        tags,
        pageSize: RECOMMENDED_PAGE_SIZE,
    };

    const [dashboards, insights, metrics] = await Promise.all([
        getDashboardsQuery(queryOptions).query(),
        getInsightsQuery(queryOptions).query(),
        getMetricsQuery(queryOptions).query(),
    ]);

    const items = [
        ...dashboards.items.map(convertEntityToCatalogItem),
        ...insights.items.map(convertEntityToCatalogItem),
        ...metrics.items.map(convertEntityToCatalogItem),
    ];

    return items.slice(0, RECOMMENDED_PAGE_SIZE);
}

export function useRecommendedItems(): UseCancelablePromiseState<ICatalogItem[], Error> {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const { result } = usePermissionsState();
    const user = result?.user;

    return useCancelablePromise<ICatalogItem[], Error>(
        {
            promise:
                user?.login && user?.organizationId
                    ? () => fetchRecommendedItems(backend, workspace, user.login, user.organizationId!)
                    : null,
            onError: (error) => console.error(error),
        },
        [backend, workspace, user?.login, user?.organizationId],
    );
}
