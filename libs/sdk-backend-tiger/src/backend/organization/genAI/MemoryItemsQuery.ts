// (C) 2026 GoodData Corporation

import {
    type EntitiesApiGetAllEntitiesOrgMemoryItemsRequest,
    EntitiesApi_GetAllEntitiesOrgMemoryItems,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    type IMemoryItemsFilterOptions,
    type IMemoryItemsQuery,
    type IMemoryItemsQueryResult,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertMemoryItem } from "../../../convertors/fromBackend/MemoryItemConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import {
    buildFilterQuery,
    buildIsDisabledClause,
    buildListClause,
    joinClauses,
} from "../../common/filtering.js";

/**
 * Organization-level memory items query.
 *
 * Mirrors the workspace-level {@link MemoryItemsQuery}, but targets the org-scoped
 * JSON:API entities endpoint `/api/v1/entities/orgMemoryItems` (no workspaceId path segment).
 *
 * @internal
 */
export class OrganizationMemoryItemsQuery implements IMemoryItemsQuery {
    private size = 50;
    private page = 0;
    private filter: string | undefined = undefined;
    private sort = {};
    private include: EntitiesApiGetAllEntitiesOrgMemoryItemsRequest["include"] = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private totalCount: number | undefined = undefined;

    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

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
            // OrgMemoryItem has no `tags` field (unlike the workspace MemoryItem), so the
            // search must not include it — otherwise the backend rejects the RSQL.
            buildFilterQuery(filter, ["id", "title", "description"]),
            buildListClause("strategy", "in", filter.strategy),
            buildListClause("strategy", "out", filter.excludeStrategy),
            // "Enabled" must also match items with a null isDisabled (treated as enabled),
            // not just isDisabled==false — otherwise items created without the field drop out.
            buildIsDisabledClause(filter.isDisabled),
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
        this.include = include as EntitiesApiGetAllEntitiesOrgMemoryItemsRequest["include"];
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
                // The generated org GetAll request has no `origin` field (unlike workspace),
                // so forward it via a cast only when set to keep the existing origin behavior.
                const originObj = (
                    this.origin === undefined ? {} : { origin: this.origin }
                ) as Partial<EntitiesApiGetAllEntitiesOrgMemoryItemsRequest>;
                const response = await this.authCall((client) =>
                    EntitiesApi_GetAllEntitiesOrgMemoryItems(client.axios, client.basePath, {
                        ...metaIncludeObj,
                        ...this.sort,
                        ...originObj,
                        filter: this.filter,
                        include: this.include,
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
                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
