// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import {
    type JsonApiAgentInAttributesInstructionsInner,
    type JsonApiAgentInDocument,
    type JsonApiAgentPatchDocument,
} from "@gooddata/api-client-tiger";
import { type IAgent, type IAgentInstruction, type IAgentPatch, isIdentifierRef } from "@gooddata/sdk-model";

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

/**
 * Instructions are an attribute rather than a relationship, and writing an agent replaces the whole
 * list — so an agent with none must send an empty array to clear what the backend already holds.
 */
function convertInstructionsToBackend(
    instructions: IAgentInstruction[] | undefined,
): JsonApiAgentInAttributesInstructionsInner[] {
    return (instructions ?? []).map((instruction) => ({
        title: instruction.title,
        content: instruction.content,
        strategy: instruction.strategy,
        isDisabled: instruction.isDisabled,
    }));
}

export function convertAgentToBackend(agent: IAgent): JsonApiAgentInDocument {
    const relationships = buildRelationships(agent);

    return {
        data: {
            type: "agent",
            id: isIdentifierRef(agent.ref) && agent.ref.identifier ? agent.ref.identifier : uuidv4(),
            attributes: {
                enabled: agent.enabled,
                name: agent.name,
                description: agent.description,
                personality: agent.personality,
                skillsMode: agent.skillsMode,
                customSkills: agent.customSkills,
                aiKnowledge: agent.aiKnowledge,
                availableToAll: agent.availableToAll,
                isPreview: agent.isPreview,
                instructions: convertInstructionsToBackend(agent.instructions),
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
                    name: agent.name,
                    description: agent.description,
                    personality: agent.personality,
                    skillsMode: agent.skillsMode,
                    customSkills: agent.customSkills,
                    aiKnowledge: agent.aiKnowledge,
                    availableToAll: agent.availableToAll,
                    isPreview: agent.isPreview,
                    instructions: agent.instructions
                        ? convertInstructionsToBackend(agent.instructions)
                        : undefined,
                }).filter(([_, value]) => value !== undefined),
            ),
            ...(relationships ? { relationships } : {}),
        },
    };
}
