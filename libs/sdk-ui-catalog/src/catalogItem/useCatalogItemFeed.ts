// (C) 2025 GoodData Corporation

import type { IDashboardsQuery, IInsightsQuery } from "@gooddata/sdk-backend-spi";
import { useCancelablePromise } from "@gooddata/sdk-ui";

import { convertDashboardToCatalogItem, convertInsightToCatalogItem } from "./converter.js";
import { getDashboardsQuery, getInsightsQuery } from "./query.js";
import type { ICatalogItemFeedProps, ICatalogItemQueryOptions } from "./types.js";
import { ObjectTypes } from "../objectType/constants.js";

export function useCatalogItemFeed({ types, backend, workspace, createdBy, tags }: ICatalogItemFeedProps) {
    const { result, error, status } = useCancelablePromise(
        {
            promise: async () => {
                const queryOptions: ICatalogItemQueryOptions = { backend, workspace, createdBy, tags };

                let dashboardsQuery: IDashboardsQuery | undefined;
                let insightsQuery: IInsightsQuery | undefined;

                if (types.length === 0) {
                    dashboardsQuery = getDashboardsQuery(queryOptions);
                    insightsQuery = getInsightsQuery(queryOptions);
                }
                if (types.includes(ObjectTypes.DASHBOARD)) {
                    dashboardsQuery = getDashboardsQuery(queryOptions);
                }
                if (types.includes(ObjectTypes.VISUALIZATION)) {
                    insightsQuery = getInsightsQuery(queryOptions);
                }

                const [dashboardsResult, insightsResult] = await Promise.all([
                    dashboardsQuery?.query(),
                    insightsQuery?.query(),
                ]);

                return {
                    items: [
                        ...(dashboardsResult?.items.map(convertDashboardToCatalogItem) ?? []),
                        ...(insightsResult?.items.map(convertInsightToCatalogItem) ?? []),
                    ],
                };
            },
        },
        [types, backend, workspace, createdBy, tags],
    );

    return {
        items: result?.items ?? [],
        error,
        status,
    };
}
