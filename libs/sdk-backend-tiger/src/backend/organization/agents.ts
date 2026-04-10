// (C) 2026 GoodData Corporation

import {
    AgentAi_ListAvailableSkills,
    EntitiesApi_CreateEntityAgents,
    EntitiesApi_DeleteEntityAgents,
    EntitiesApi_GetEntityAgents,
    EntitiesApi_PatchEntityAgents,
    EntitiesApi_UpdateEntityAgents,
    type ITigerClientBase,
} from "@gooddata/api-client-tiger";
import { type IAgentsQuery, type IOrganizationAgentsService } from "@gooddata/sdk-backend-spi";
import {
    type IAgent,
    type IAgentPatch,
    type IAgentSkill,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { AgentsQuery } from "./agentsQuery.js";
import { convertAgent } from "../../convertors/fromBackend/AgentConverter.js";
import { convertAgentSkill } from "../../convertors/fromBackend/agentSkillConvertor.js";
import {
    convertAgentPatchToBackend,
    convertAgentToBackend,
} from "../../convertors/toBackend/AgentConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

const AGENT_INCLUDE: Array<"createdBy" | "modifiedBy" | "userGroups"> = [
    "createdBy",
    "modifiedBy",
    "userGroups",
];

export class OrganizationAgentsService implements IOrganizationAgentsService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getAvailableSkills(): Promise<IAgentSkill[]> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await AgentAi_ListAvailableSkills(client.axios, client.basePath);
            return result.data.map(convertAgentSkill);
        });
    }

    public getAgentsQuery(): IAgentsQuery {
        return new AgentsQuery(this.authCall);
    }

    public getAgent(ref: ObjRef): Promise<IAgent | undefined> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetEntityAgents(client.axios, client.basePath, {
                id: isIdentifierRef(ref) ? ref.identifier : "",
                include: AGENT_INCLUDE,
            });
            const agent = result.data?.data;

            if (!agent) {
                return undefined;
            }

            return convertAgent(agent, result.data?.included);
        });
    }

    public createAgent(agent: IAgent): Promise<IAgent> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_CreateEntityAgents(client.axios, client.basePath, {
                jsonApiAgentInDocument: convertAgentToBackend(agent),
                include: AGENT_INCLUDE,
            });

            return convertAgent(result.data.data, result.data.included);
        });
    }

    public updateAgent(agent: IAgent): Promise<IAgent> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_UpdateEntityAgents(client.axios, client.basePath, {
                id: isIdentifierRef(agent.ref) ? agent.ref.identifier : "",
                jsonApiAgentInDocument: convertAgentToBackend(agent),
                include: AGENT_INCLUDE,
            });

            return convertAgent(result.data.data, result.data.included);
        });
    }

    public patchAgent(agent: IAgentPatch): Promise<IAgent> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_PatchEntityAgents(client.axios, client.basePath, {
                id: isIdentifierRef(agent.ref) ? agent.ref.identifier : "",
                jsonApiAgentPatchDocument: convertAgentPatchToBackend(agent),
                include: AGENT_INCLUDE,
            });

            return convertAgent(result.data.data, result.data.included);
        });
    }

    public deleteAgent(ref: ObjRef): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await EntitiesApi_DeleteEntityAgents(client.axios, client.basePath, {
                id: isIdentifierRef(ref) ? ref.identifier : "",
            });
        });
    }
}
