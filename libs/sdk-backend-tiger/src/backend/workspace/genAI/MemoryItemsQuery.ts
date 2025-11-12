// (C) 2024-2025 GoodData Corporation

import { EntitiesApiGetAllEntitiesMemoryItemsRequest } from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    IMemoryItemsFilterOptions,
    type IMemoryItemsQuery,
    type IMemoryItemsQueryResult,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertMemoryItem } from "../../../convertors/fromBackend/MemoryItemConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { buildFilterQuery, buildListClause, joinClauses } from "../../common/filtering.js";

export class MemoryItemsQuery implements IMemoryItemsQuery {
    private size = 50;
    private page = 0;
    private filter: string | undefined = undefined;
    private sort = {};
    private include: EntitiesApiGetAllEntitiesMemoryItemsRequest["include"] = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesMemoryItemsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IMemoryItemsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IMemoryItemsQuery {
        this.page = page;
        return this;
    }
    withFilter(filter: IMemoryItemsFilterOptions): IMemoryItemsQuery {
        this.filter = joinClauses([
            buildFilterQuery(filter),
            buildListClause("strategy", "in", filter.strategy),
            buildListClause("strategy", "out", filter.excludeStrategy),
            buildListClause(
                "isDisabled",
                "in",
                filter.isDisabled === undefined ? [] : [String(filter.isDisabled)],
            ),
        ]);
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IMemoryItemsQuery {
        this.sort = { sort };
        return this;
    }

    withInclude(include: string[]): IMemoryItemsQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as EntitiesApiGetAllEntitiesMemoryItemsRequest["include"];
        return this;
    }

    withOrigin(origin: ObjectOrigin): IMemoryItemsQuery {
        this.origin = origin;
        return this;
    }

    query(): Promise<IMemoryItemsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};
                const response = await this.authCall((client) =>
                    client.entities.getAllEntitiesMemoryItems({
                        ...this.requestParameters,
                        ...metaIncludeObj,
                        ...this.sort,
                        filter: this.filter,
                        include: this.include,
                        origin: this.origin,
                        size: limit,
                        page: offset / limit,
                    }),
                );

                const totalCount = response.data.meta?.page?.totalElements;
                if (!(totalCount === null || totalCount === undefined)) {
                    this.setTotalCount(totalCount);
                }

                const items = response.data.data.map((item) =>
                    convertMemoryItem(item, response.data.included ?? []),
                );
                return { items, totalCount: totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
