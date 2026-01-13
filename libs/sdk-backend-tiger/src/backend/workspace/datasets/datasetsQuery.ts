// (C) 2025-2026 GoodData Corporation

import {
    type EntitiesApiGetAllEntitiesDatasetsRequest,
    EntitiesApi_SearchEntitiesDatasets,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { EntitiesApi_GetAllEntitiesDatasets } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import type {
    IDatasetsQuery,
    IDatasetsQueryFilterOptions,
    IDatasetsQueryResult,
    QueryMethod,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertDataSetItem } from "../../../convertors/fromBackend/DataSetConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { buildFilterQuery, buildIsClause, joinClauses } from "../../common/filtering.js";
import { buildSortQuery } from "../../common/sorting.js";

type DatasetInclude = NonNullable<EntitiesApiGetAllEntitiesDatasetsRequest["include"]>[number];
type DatasetMetaInclude = NonNullable<EntitiesApiGetAllEntitiesDatasetsRequest["metaInclude"]>[number];

export class DatasetsQuery implements IDatasetsQuery {
    private size = 50;
    private page = 0;
    private filter: IDatasetsQueryFilterOptions | undefined = undefined;
    private sort: string[] | undefined = undefined;
    private include: DatasetInclude[] | undefined = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private method: QueryMethod = "GET";
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesDatasetsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IDatasetsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IDatasetsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: IDatasetsQueryFilterOptions): IDatasetsQuery {
        this.filter = filter;
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IDatasetsQuery {
        this.sort = sort;
        return this;
    }

    withInclude(include: string[]): IDatasetsQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as DatasetInclude[];
        return this;
    }

    withOrigin(origin: ObjectOrigin): IDatasetsQuery {
        this.origin = origin;
        return this;
    }

    withMethod(method: QueryMethod): IDatasetsQuery {
        this.method = method;
        return this;
    }

    query(): Promise<IDatasetsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const filter: IDatasetsQueryFilterOptions = { ...(this.filter ?? {}) };

                // NOTE: Datasets endpoint does not support filtering by createdBy.
                if ("createdBy" in filter) {
                    delete filter.createdBy;
                }
                if ("excludeCreatedBy" in filter) {
                    delete filter.excludeCreatedBy;
                }

                // NOTE: Datasets API doesn't support `isHidden` filter parameter yet.
                // When filtering for hidden datasets, return empty results immediately
                // since datasets cannot be hidden at this time.
                if ("isHidden" in filter) {
                    if (filter.isHidden === true) {
                        return { items: [], totalCount: 0 };
                    }
                    delete filter.isHidden;
                }

                const filterQuery = joinClauses([
                    buildFilterQuery(filter),
                    buildIsClause("type", filter.dataSetType),
                ]);

                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaInclude: DatasetMetaInclude[] | undefined =
                    this.totalCount === undefined ? ["page", "origin"] : ["origin"];

                const items = await this.authCall((client) => {
                    if (this.method === "POST") {
                        return EntitiesApi_SearchEntitiesDatasets(client.axios, client.basePath, {
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

                    return EntitiesApi_GetAllEntitiesDatasets(client.axios, client.basePath, {
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
                        return data.data.map((dataSet) => convertDataSetItem(dataSet, data.included));
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
