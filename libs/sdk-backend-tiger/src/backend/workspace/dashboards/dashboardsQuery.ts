// (C) 2024-2025 GoodData Corporation

import isNil from "lodash/isNil.js";

import {
    EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { IDashboardsQuery, IDashboardsQueryResult } from "@gooddata/sdk-backend-spi";

import { convertAnalyticalDashboardToListItems } from "../../../convertors/fromBackend/analyticalDashboards/AnalyticalDashboardConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class DashboardsQuery implements IDashboardsQuery {
    private size = 50;
    private page = 0;
    private filter: string | undefined = undefined;
    private sort = {};
    private include: EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest["include"] = undefined;
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

    withFilter(filter: { title?: string; createdBy?: string; tags?: string[] }): IDashboardsQuery {
        const filters: string[] = [];
        if (filter.title) {
            // containsic === contains + ignore case
            filters.push(`title=containsic="${filter.title}"`);
        }
        if (filter.createdBy) {
            filters.push(`createdBy.id=="${filter.createdBy}"`);
        }
        if (filter.tags && filter.tags.length > 0) {
            const tags = filter.tags.map((tag) => `"${tag}"`);
            filters.push(`tags=in=(${tags.join(",")})`);
        }
        if (filters.length > 0) {
            this.filter = filters.join(";");
        }

        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IDashboardsQuery {
        this.sort = { sort };
        return this;
    }

    withInclude(include: string[]): IDashboardsQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest["include"];
        return this;
    }

    query(): Promise<IDashboardsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined
                        ? { metaInclude: ["page" as const, "accessInfo" as const] }
                        : { metaInclude: ["accessInfo" as const] };

                const items = await this.authCall((client) =>
                    client.entities.getAllEntitiesAnalyticalDashboards({
                        ...this.requestParameters,
                        ...metaIncludeObj,
                        ...this.sort,
                        filter: this.filter,
                        include: this.include,
                        size: limit,
                        page: offset / limit,
                    }),
                )
                    .then((res) => MetadataUtilities.filterValidEntities(res.data))
                    .then((data) => {
                        const totalCount = data.meta?.page?.totalElements;
                        if (!isNil(totalCount)) {
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
