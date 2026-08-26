// (C) 2026 GoodData Corporation

import {
    type EntitiesApiGetAllEntitiesComputedAttributesRequest,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import {
    EntitiesApi_GetAllEntitiesComputedAttributes,
    EntitiesApi_SearchEntitiesComputedAttributes,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    type IComputedAttributesQuery,
    type IComputedAttributesQueryResult,
    type IFilterBaseOptions,
    type QueryMethod,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertComputedAttributesWithLinks } from "../../../convertors/fromBackend/ComputedAttributeConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { buildFilterQuery } from "../../common/filtering.js";
import { buildSortQuery } from "../../common/sorting.js";

export class ComputedAttributesQuery implements IComputedAttributesQuery {
    private size = 50;
    private page = 0;
    private filter: IFilterBaseOptions | undefined = undefined;
    private sort: string[] | undefined = undefined;
    private include: EntitiesApiGetAllEntitiesComputedAttributesRequest["include"] = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private method: QueryMethod = "GET";
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesComputedAttributesRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IComputedAttributesQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IComputedAttributesQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: IFilterBaseOptions): IComputedAttributesQuery {
        this.filter = filter;
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IComputedAttributesQuery {
        this.sort = sort;
        return this;
    }

    withInclude(include: string[]): IComputedAttributesQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as EntitiesApiGetAllEntitiesComputedAttributesRequest["include"];
        return this;
    }

    withOrigin(origin: ObjectOrigin): IComputedAttributesQuery {
        this.origin = origin;
        return this;
    }

    withMethod(method: QueryMethod): IComputedAttributesQuery {
        this.method = method;
        return this;
    }

    query(): Promise<IComputedAttributesQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const filterOptions: IFilterBaseOptions = this.filter ?? {};
                const filterQuery = buildFilterQuery(filterOptions);

                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaInclude: EntitiesApiGetAllEntitiesComputedAttributesRequest["metaInclude"] =
                    this.totalCount === undefined ? (["page"] as const) : undefined;

                const items = await this.authCall((client) => {
                    if (this.method === "POST") {
                        return EntitiesApi_SearchEntitiesComputedAttributes(client.axios, client.basePath, {
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

                    return EntitiesApi_GetAllEntitiesComputedAttributes(client.axios, client.basePath, {
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
                        return convertComputedAttributesWithLinks(data);
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
