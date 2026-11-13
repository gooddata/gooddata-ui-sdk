// (C) 2026 GoodData Corporation

import { type EntitiesApiGetAllEntitiesDocumentsRequest } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_GetAllEntitiesDocuments,
    EntitiesApi_SearchEntitiesDocuments,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    type IFilterBaseOptions,
    type IPublisherDocumentsQueryResultV2,
    type IPublisherDocumentsQueryV2,
    type QueryMethod,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertPublisherDocumentSummaryV2 } from "../../convertors/fromBackend/PublisherConverterV2.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { buildFilterQuery } from "../common/filtering.js";
import { buildSortQuery } from "../common/sorting.js";

export class PublisherDocumentsQueryV2 implements IPublisherDocumentsQueryV2 {
    private size = 50;
    private page = 0;
    private filter: IFilterBaseOptions = {};
    private sort: string[] | undefined = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private method: QueryMethod = "GET";

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    withSize(size: number): IPublisherDocumentsQueryV2 {
        this.size = size;
        return this;
    }

    withPage(page: number): IPublisherDocumentsQueryV2 {
        this.page = page;
        return this;
    }

    withFilter(filter: IFilterBaseOptions): IPublisherDocumentsQueryV2 {
        this.filter = filter;
        return this;
    }

    withSorting(sort: string[]): IPublisherDocumentsQueryV2 {
        this.sort = sort;
        return this;
    }

    withOrigin(origin: ObjectOrigin): IPublisherDocumentsQueryV2 {
        this.origin = origin;
        return this;
    }

    withMethod(method: QueryMethod): IPublisherDocumentsQueryV2 {
        this.method = method;
        return this;
    }

    query(): Promise<IPublisherDocumentsQueryResultV2> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const { isHidden, certification, ...filter } = this.filter;
                if (isHidden || certification) {
                    return { items: [], totalCount: 0 };
                }

                const filterQuery = buildFilterQuery(filter);
                const include: EntitiesApiGetAllEntitiesDocumentsRequest["include"] = [
                    "createdBy",
                    "modifiedBy",
                ];
                const metaInclude: EntitiesApiGetAllEntitiesDocumentsRequest["metaInclude"] = [
                    "origin",
                    "page",
                ];
                const { data } = await this.authCall((client) => {
                    if (this.method === "POST") {
                        return EntitiesApi_SearchEntitiesDocuments(client.axios, client.basePath, {
                            workspaceId: this.workspace,
                            origin: this.origin,
                            entitySearchBody: {
                                sort: buildSortQuery(this.sort),
                                filter: filterQuery,
                                include,
                                metaInclude,
                                page: { index: offset / limit, size: limit },
                            },
                        });
                    }
                    return EntitiesApi_GetAllEntitiesDocuments(client.axios, client.basePath, {
                        workspaceId: this.workspace,
                        origin: this.origin,
                        filter: filterQuery,
                        include,
                        metaInclude,
                        sort: this.sort,
                        page: offset / limit,
                        size: limit,
                    });
                });
                return {
                    items: data.data.map((entity) =>
                        convertPublisherDocumentSummaryV2(entity, data.included),
                    ),
                    totalCount: data.meta?.page?.totalElements ?? offset + data.data.length,
                };
            },
            this.size,
            this.page * this.size,
        );
    }
}
