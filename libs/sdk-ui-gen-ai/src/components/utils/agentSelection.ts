// (C) 2026 GoodData Corporation

import { type GenAIAgent, type IChatConversationLocal } from "../../model.js";

export type AgentSelectionStatus = {
    availableAgents: GenAIAgent[];
    hasNoAgents: boolean;
    isSelectionLoading: boolean;
};

export function getEffectiveSelectedAgentId({
    agents,
    conversationAgentId,
    selectedAgentId,
}: {
    agents: GenAIAgent[];
    conversationAgentId?: string;
    selectedAgentId?: string;
}): string | undefined {
    const availableAgentIds = new Set(agents.map((agent) => agent.id));

    if (conversationAgentId && availableAgentIds.has(conversationAgentId)) {
        return conversationAgentId;
    }

    if (selectedAgentId && availableAgentIds.has(selectedAgentId)) {
        return selectedAgentId;
    }

    return undefined;
}

export function getAgentSelectionUpdate({
    agents,
    conversations,
    conversationAgentId,
    selectedAgentId,
}: {
    agents: GenAIAgent[];
    conversations?: IChatConversationLocal[];
    conversationAgentId?: string;
    selectedAgentId?: string;
}): { agentId: string | undefined } | undefined {
    const effectiveSelectedAgentId = getEffectiveSelectedAgentId({
        agents,
        conversationAgentId,
        selectedAgentId,
    });

    if (conversationAgentId && effectiveSelectedAgentId === conversationAgentId) {
        return conversationAgentId === selectedAgentId ? undefined : { agentId: conversationAgentId };
    }

    // An unavailable conversation agent still requires reaffirming an otherwise valid selection.
    if (agents.length && (conversationAgentId || effectiveSelectedAgentId === undefined)) {
        // Resolve defaults before history loads; available history is only a best-effort heuristic.
        return { agentId: effectiveSelectedAgentId ?? selectDefaultAgentId(agents, conversations) };
    }

    return undefined;
}

export function getStandaloneSelectedAgentId({
    agents,
    selectedAgentId,
}: {
    agents: GenAIAgent[] | undefined;
    selectedAgentId?: string;
}): string | undefined {
    return agents?.find((agent) => agent.id === selectedAgentId) ? selectedAgentId : agents?.[0]?.id;
}

export function getAgentSelectionStatus({
    agentSwitchingActive,
    assistantLoading = false,
    conversationsLoading = true,
    agents,
    selectedAgentId,
}: {
    agentSwitchingActive: boolean;
    assistantLoading?: boolean;
    conversationsLoading?: boolean;
    agents: GenAIAgent[] | undefined;
    selectedAgentId?: string;
}): AgentSelectionStatus {
    const availableAgents = agents ?? [];
    const isSelectedAgentAvailable =
        !!selectedAgentId && availableAgents.some((a) => a.id === selectedAgentId);

    return {
        availableAgents,
        hasNoAgents: agentSwitchingActive && agents?.length === 0,
        // The conversations list is part of the loading condition so that the dropdown goes
        // through a single loading phase on startup. Without it, the dropdown briefly resolves
        // to a default agent after agents load, then flips back to loading when the current
        // conversation (with a possibly different agent) starts loading.
        isSelectionLoading:
            agentSwitchingActive &&
            (assistantLoading ||
                agents === undefined ||
                conversationsLoading ||
                (availableAgents.length > 0 && !isSelectedAgentAvailable)),
    };
}

export function selectDefaultAgentId(
    agents: GenAIAgent[],
    conversations: IChatConversationLocal[] | undefined,
): string | undefined {
    const lastUsedAgentId = agents
        .filter((agent) => agent.lastUsedAt)
        .sort((a, b) => toTimestamp(b.lastUsedAt) - toTimestamp(a.lastUsedAt))[0]?.id;

    if (lastUsedAgentId) {
        return lastUsedAgentId;
    }

    const availableAgentIds = new Set(agents.map((agent) => agent.id));
    const lastConversationAgentId = conversations
        ?.filter((conversation) => conversation.agentId && availableAgentIds.has(conversation.agentId))
        .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))[0]?.agentId;

    if (lastConversationAgentId) {
        return lastConversationAgentId;
    }

    return agents.slice().sort((a, b) => toTimestamp(b.modifiedAt) - toTimestamp(a.modifiedAt))[0]?.id;
}

function toTimestamp(value: string | undefined): number {
    return value ? Date.parse(value) || 0 : 0;
}
