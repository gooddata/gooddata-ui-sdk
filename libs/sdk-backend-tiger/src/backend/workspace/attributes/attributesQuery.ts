// (C) 2024-2025 GoodData Corporation

import { EntitiesApiGetAllEntitiesAttributesRequest, MetadataUtilities } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_GetAllEntitiesAttributes,
    EntitiesApi_SearchEntitiesAttributes,
} from "@gooddata/api-client-tiger/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    IAttributesQuery,
    IAttributesQueryResult,
    IFilterBaseOptions,
    QueryMethod,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertAttributesWithSideloadedLabels } from "../../../convertors/fromBackend/MetadataConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { buildFilterQuery } from "../../common/filtering.js";
import { buildSortQuery } from "../../common/sorting.js";

export class AttributesQuery implements IAttributesQuery {
    private size = 50;
    private page = 0;
    private filter: IFilterBaseOptions | undefined = undefined;
    private sort: string[] | undefined = undefined;
    private include: EntitiesApiGetAllEntitiesAttributesRequest["include"] = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private method: QueryMethod = "GET";
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesAttributesRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IAttributesQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IAttributesQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: IFilterBaseOptions): IAttributesQuery {
        this.filter = filter;
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IAttributesQuery {
        this.sort = sort;
        return this;
    }

    withInclude(include: string[]): IAttributesQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as EntitiesApiGetAllEntitiesAttributesRequest["include"];
        return this;
    }

    withOrigin(origin: ObjectOrigin): IAttributesQuery {
        this.origin = origin;
        return this;
    }

    withMethod(method: QueryMethod): IAttributesQuery {
        this.method = method;
        return this;
    }

    query(): Promise<IAttributesQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const filterOptions: IFilterBaseOptions = this.filter ?? {};
                const filterQuery = buildFilterQuery(filterOptions);

                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaInclude: EntitiesApiGetAllEntitiesAttributesRequest["metaInclude"] =
                    this.totalCount === undefined ? (["page"] as const) : undefined;

                const items = await this.authCall((client) => {
                    if (this.method === "POST") {
                        return EntitiesApi_SearchEntitiesAttributes(client.axios, client.basePath, {
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

                    return EntitiesApi_GetAllEntitiesAttributes(client.axios, client.basePath, {
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
                        return convertAttributesWithSideloadedLabels(data);
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
