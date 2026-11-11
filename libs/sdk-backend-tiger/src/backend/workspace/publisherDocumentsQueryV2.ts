// (C) 2026 GoodData Corporation

import { type EntitiesApiGetAllEntitiesDocumentsRequest } from "@gooddata/api-client-tiger";
import { EntitiesApi_GetAllEntitiesDocuments } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    type IFilterBaseOptions,
    type IPublisherDocumentsQueryResultV2,
    type IPublisherDocumentsQueryV2,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertPublisherDocumentSummaryV2 } from "../../convertors/fromBackend/PublisherConverterV2.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { buildFilterQuery } from "../common/filtering.js";

export class PublisherDocumentsQueryV2 implements IPublisherDocumentsQueryV2 {
    private size = 50;
    private page = 0;
    private filter: IFilterBaseOptions = {};
    private sort: string[] | undefined = undefined;
    private origin: ObjectOrigin | undefined = undefined;

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

    query(): Promise<IPublisherDocumentsQueryResultV2> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const { isHidden, certification, ...filter } = this.filter;
                if (isHidden || certification) {
                    return { items: [], totalCount: 0 };
                }

                const request: EntitiesApiGetAllEntitiesDocumentsRequest = {
                    workspaceId: this.workspace,
                    origin: this.origin,
                    filter: buildFilterQuery(filter),
                    include: ["createdBy", "modifiedBy"],
                    metaInclude: ["origin", "page"],
                    sort: this.sort,
                    page: offset / limit,
                    size: limit,
                };
                const { data } = await this.authCall((client) =>
                    EntitiesApi_GetAllEntitiesDocuments(client.axios, client.basePath, request),
                );
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
