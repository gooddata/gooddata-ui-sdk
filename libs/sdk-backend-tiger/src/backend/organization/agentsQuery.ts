// (C) 2026 GoodData Corporation

import { EntitiesApi_GetAllEntitiesAgents } from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { type IAgentsQuery, type IAgentsQueryResult } from "@gooddata/sdk-backend-spi";
import { type IAgent } from "@gooddata/sdk-model";

import { convertAgent } from "../../convertors/fromBackend/AgentConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class AgentsQuery implements IAgentsQuery {
    private size = 100;
    private page = 0;
    private sort = {};
    private filter: { name?: string } = {};
    private totalCount: number | undefined = undefined;

    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IAgentsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IAgentsQuery {
        this.page = page;
        return this;
    }

    withSorting(sort: string[]): IAgentsQuery {
        this.sort = { sort };
        return this;
    }

    withFilter(filter: { name?: string }): IAgentsQuery {
        this.filter = { ...filter };
        this.totalCount = undefined;
        return this;
    }

    query(): Promise<IAgentsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const filterObj = this.filter.name ? { filter: `name=containsic='${this.filter.name}'` } : {};

                const items = await this.authCall((client) =>
                    EntitiesApi_GetAllEntitiesAgents(client.axios, client.basePath, {
                        ...metaIncludeObj,
                        ...filterObj,
                        ...this.sort,
                        include: ["userGroups"],
                        size: limit,
                        page: offset / limit,
                    }),
                ).then((res) => {
                    const data = res.data;
                    const totalCount = data.meta?.page?.totalElements;
                    if (!(totalCount === null || totalCount === undefined)) {
                        this.setTotalCount(totalCount);
                    }
                    return data.data.map((agent) => convertAgent(agent, data.included));
                });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }

    async queryAll(): Promise<IAgent[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }
}
