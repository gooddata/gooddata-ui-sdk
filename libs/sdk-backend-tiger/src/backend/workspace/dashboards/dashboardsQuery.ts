// (C) 2024-2026 GoodData Corporation

import {
    type EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest,
    EntitiesApi_SearchEntitiesAnalyticalDashboards,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { DashboardsApi_GetAllEntitiesAnalyticalDashboards } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import type {
    IDashboardsQuery,
    IDashboardsQueryResult,
    IFilterBaseOptions,
    QueryMethod,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertAnalyticalDashboardToListItems } from "../../../convertors/fromBackend/analyticalDashboards/AnalyticalDashboardConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { buildFilterQuery } from "../../common/filtering.js";
import { buildSortQuery } from "../../common/sorting.js";

type DashboardInclude = NonNullable<EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest["include"]>[number];

type DashboardMetaInclude = NonNullable<
    EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest["metaInclude"]
>[number];

export class DashboardsQuery implements IDashboardsQuery {
    private size = 50;
    private page = 0;
    private filter: IFilterBaseOptions | undefined = undefined;
    private sort: string[] | undefined = undefined;
    private include: DashboardInclude[] | undefined = undefined;
    private metaInclude: DashboardMetaInclude[] | undefined = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private method: QueryMethod = "GET";
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IDashboardsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IDashboardsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: IFilterBaseOptions): IDashboardsQuery {
        this.filter = filter;
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IDashboardsQuery {
        this.sort = sort;
        return this;
    }

    withInclude(include: string[]): IDashboardsQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as DashboardInclude[];
        return this;
    }

    withMetaInclude(metaInclude: string[]): IDashboardsQuery {
        // NOTE: Unsupported meta include values handling is delegated to the backend
        this.metaInclude = metaInclude as DashboardMetaInclude[];
        return this;
    }

    withOrigin(origin: ObjectOrigin): IDashboardsQuery {
        this.origin = origin;
        return this;
    }

    withMethod(method: QueryMethod): IDashboardsQuery {
        this.method = method;
        return this;
    }

    query(): Promise<IDashboardsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const filter: IFilterBaseOptions = this.filter ?? {};

                // NOTE: Dashboards API doesn't support `isHidden` filter parameter yet.
                // When filtering for hidden dashboards, return empty results immediately
                // since no dashboards can be hidden at this time.
                if ("isHidden" in filter) {
                    if (filter.isHidden === true) {
                        return { items: [], totalCount: 0 };
                    }
                    delete filter.isHidden;
                }

                const filterQuery = buildFilterQuery(filter);
                const metaIncludeSet: Set<DashboardMetaInclude> = new Set([
                    "accessInfo",
                    // For backend performance reasons, we do not want to ask for paging info each time.
                    ...(this.totalCount === undefined ? ["page" as const] : []),
                    ...(this.metaInclude ?? []),
                ]);
                const metaInclude = [...metaIncludeSet];

                const items = await this.authCall((client) => {
                    if (this.method === "POST") {
                        return EntitiesApi_SearchEntitiesAnalyticalDashboards(client.axios, client.basePath, {
                            workspaceId: this.requestParameters.workspaceId,
                            origin: this.origin,
                            entitySearchBody: {
                                sort: buildSortQuery(this.sort),
                                filter: filterQuery,
                                include: this.include,
                                metaInclude,
                                page: {
                                    index: offset / limit,
                                    size: limit,
                                },
                            },
                        });
                    }
                    return DashboardsApi_GetAllEntitiesAnalyticalDashboards(client.axios, client.basePath, {
                        ...this.requestParameters,
                        sort: this.sort,
                        filter: filterQuery,
                        include: this.include,
                        metaInclude,
                        origin: this.origin,
                        size: limit,
                        page: offset / limit,
                    });
                })
                    .then((res) => MetadataUtilities.filterValidEntities(res.data))
                    .then((data) => {
                        const totalCount = data.meta?.page?.totalElements;
                        if (!(totalCount === null || totalCount === undefined)) {
                            this.setTotalCount(totalCount);
                        }
                        return convertAnalyticalDashboardToListItems(data);
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
