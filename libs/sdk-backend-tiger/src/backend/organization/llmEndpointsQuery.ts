// (C) 2024-2026 GoodData Corporation

import { EntitiesApi_GetAllEntitiesLlmEndpoints } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { type ILlmEndpointsQuery, type ILlmEndpointsQueryResult } from "@gooddata/sdk-backend-spi";
import { type ILlmEndpointOpenAI } from "@gooddata/sdk-model";

import { convertLlmEndpoint } from "../../convertors/fromBackend/llmEndpointConvertor.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class LlmEndpointsQuery implements ILlmEndpointsQuery {
    private size = 100;
    private page = 0;
    private sort = {};
    private totalCount: number | undefined = undefined;

    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): ILlmEndpointsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): ILlmEndpointsQuery {
        this.page = page;
        return this;
    }

    withSorting(sort: string[]): ILlmEndpointsQuery {
        this.sort = { sort };
        return this;
    }

    query(): Promise<ILlmEndpointsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const items = await this.authCall((client) =>
                    EntitiesApi_GetAllEntitiesLlmEndpoints(client.axios, client.basePath, {
                        ...metaIncludeObj,
                        ...this.sort,
                        size: limit,
                        page: offset / limit,
                    }),
                ).then((res) => {
                    const data = res.data;
                    const totalCount = data.meta?.page?.totalElements;
                    if (!(totalCount === null || totalCount === undefined)) {
                        this.setTotalCount(totalCount);
                    }
                    return data.data.map(convertLlmEndpoint);
                });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }

    async queryAll(): Promise<ILlmEndpointOpenAI[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }
}
