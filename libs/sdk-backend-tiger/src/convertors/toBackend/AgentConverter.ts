// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { type JsonApiAgentInDocument, type JsonApiAgentPatchDocument } from "@gooddata/api-client-tiger";
import { type IAgent, type IAgentPatch, isIdentifierRef } from "@gooddata/sdk-model";

function buildRelationships(agent: Pick<IAgent, "userGroups">) {
    if (!agent.userGroups?.length) {
        return undefined;
    }
    return {
        userGroups: {
            data: agent.userGroups.map((group) => ({
                type: "userGroup" as const,
                id: group.id,
            })),
        },
    };
}

export function convertAgentToBackend(agent: IAgent): JsonApiAgentInDocument {
    const relationships = buildRelationships(agent);

    return {
        data: {
            type: "agent",
            id: isIdentifierRef(agent.ref) && agent.ref.identifier ? agent.ref.identifier : uuidv4(),
            attributes: {
                enabled: agent.enabled,
                title: agent.title,
                description: agent.description,
                personality: agent.personality,
                skillsMode: agent.skillsMode,
                customSkills: agent.customSkills,
                aiKnowledge: agent.aiKnowledge,
                availableToAll: agent.availableToAll,
            },
            ...(relationships ? { relationships } : {}),
        },
    };
}

export function convertAgentPatchToBackend(agent: IAgentPatch): JsonApiAgentPatchDocument {
    const relationships = buildRelationships(agent);

    return {
        data: {
            type: "agent",
            id: isIdentifierRef(agent.ref) ? agent.ref.identifier : "",
            attributes: Object.fromEntries(
                Object.entries({
                    enabled: agent.enabled,
                    title: agent.title,
                    description: agent.description,
                    personality: agent.personality,
                    skillsMode: agent.skillsMode,
                    customSkills: agent.customSkills,
                    aiKnowledge: agent.aiKnowledge,
                    availableToAll: agent.availableToAll,
                }).filter(([_, value]) => value !== undefined),
            ),
            ...(relationships ? { relationships } : {}),
        },
    };
}
