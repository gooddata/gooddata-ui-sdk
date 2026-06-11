// (C) 2026 GoodData Corporation

import { AgentsAi_ListAgents, type AiAgentListItemResponse } from "@gooddata/api-client-tiger";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import {
    type IAgentsQuery,
    type IAgentsQueryResult,
    type IWorkspaceAgentsService,
} from "@gooddata/sdk-backend-spi";
import { type IAgent, idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class TigerWorkspaceAgentsService implements IWorkspaceAgentsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    public getAgentsQuery(): IAgentsQuery {
        return new WorkspaceAgentsQuery(this.authCall, this.workspaceId);
    }
}

class WorkspaceAgentsQuery implements IAgentsQuery {
    private size = 100;
    private page = 0;
    private sort: string[] = [];
    private filter: { name?: string; isPreview?: boolean } = {};

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    public withSize(size: number): IAgentsQuery {
        this.size = size;
        return this;
    }

    public withPage(page: number): IAgentsQuery {
        this.page = page;
        return this;
    }

    public withSorting(sort: string[]): IAgentsQuery {
        this.sort = sort;
        return this;
    }

    public withFilter(filter: { name?: string; isPreview?: boolean }): IAgentsQuery {
        this.filter = { ...filter };
        return this;
    }

    public async query(): Promise<IAgentsQueryResult> {
        const agents = await this.authCall(async (client) => {
            const response = await AgentsAi_ListAgents(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            });

            return response.data.agents.map(agentToModel);
        });

        const filteredAgents = this.applyFilter(agents);
        const sortedAgents = this.applySorting(filteredAgents);

        return new InMemoryPaging(sortedAgents, this.size, this.page * this.size);
    }

    public async queryAll(): Promise<IAgent[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }

    private applyFilter(agents: IAgent[]): IAgent[] {
        let result = agents;

        if (this.filter.isPreview === true) {
            result = result.filter((agent) => agent.isPreview === true);
        } else if (this.filter.isPreview === false) {
            result = result.filter((agent) => agent.isPreview !== true);
        }

        if (this.filter.name) {
            const search = this.filter.name.toLocaleLowerCase();
            result = result.filter((agent) => agent.name?.toLocaleLowerCase().includes(search));
        }

        return result;
    }

    private applySorting(agents: IAgent[]): IAgent[] {
        return this.sort.reduce((sortedAgents, sort) => {
            const [property, direction = "asc"] = sort.split(",");
            if (property !== "name") {
                return sortedAgents;
            }

            return [...sortedAgents].sort((a, b) => {
                const result = (a.name ?? "").localeCompare(b.name ?? "");
                return direction === "desc" ? -result : result;
            });
        }, agents);
    }
}

function agentToModel(agent: AiAgentListItemResponse): IAgent {
    return {
        ref: idRef(agent.id),
        name: agent.name,
        description: agent.description ?? undefined,
        availableToAll: agent.isAvailableToAll,
        modifiedAt: agent.modifiedAt ?? undefined,
        lastUsedAt: agent.lastUsedAt ?? undefined,
    };
}
