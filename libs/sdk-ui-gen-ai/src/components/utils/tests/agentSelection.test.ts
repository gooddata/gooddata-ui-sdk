// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type GenAIAgent, type IChatConversationLocal } from "../../../model.js";
import {
    getAgentSelectionStatus,
    getEffectiveSelectedAgentId,
    selectDefaultAgentId,
} from "../agentSelection.js";

describe("selectDefaultAgentId", () => {
    it("should select the last used available agent from agent metadata", () => {
        const agents: GenAIAgent[] = [
            agent("sales", { lastUsedAt: "2026-01-01T00:00:00Z", modifiedAt: "2026-05-01T00:00:00Z" }),
            agent("finance", { lastUsedAt: "2026-02-01T00:00:00Z", modifiedAt: "2026-04-01T00:00:00Z" }),
            agent("support", { modifiedAt: "2026-06-01T00:00:00Z" }),
        ];

        expect(selectDefaultAgentId(agents, [conversation("old", "sales")])).toBe("finance");
    });

    it("should select the last prior conversation agent that is still available when last-used metadata is absent", () => {
        const agents: GenAIAgent[] = [
            agent("sales", { modifiedAt: "2026-04-01T00:00:00Z" }),
            agent("support", { modifiedAt: "2026-06-01T00:00:00Z" }),
        ];
        const conversations: IChatConversationLocal[] = [
            conversation("new", "retired", "2026-06-01T00:00:00Z"),
            conversation("middle", "sales", "2026-05-01T00:00:00Z"),
            conversation("old", "support", "2026-04-01T00:00:00Z"),
        ];

        expect(selectDefaultAgentId(agents, conversations)).toBe("sales");
    });

    it("should select the last edited available agent when there is no usable prior agent", () => {
        const agents: GenAIAgent[] = [
            agent("sales", { modifiedAt: "2026-04-01T00:00:00Z" }),
            agent("support", { modifiedAt: "2026-06-01T00:00:00Z" }),
        ];

        expect(selectDefaultAgentId(agents, [conversation("old", "retired")])).toBe("support");
        expect(selectDefaultAgentId(agents, [])).toBe("support");
    });
});

describe("getAgentSelectionStatus", () => {
    it("should keep legacy mode unblocked when agent switching is disabled", () => {
        expect(
            getAgentSelectionStatus({
                agentSwitchingActive: false,
                agents: undefined,
            }),
        ).toEqual({
            availableAgents: [],
            hasNoAgents: false,
            isSelectionLoading: false,
        });
    });

    it("should block as no agents when the loaded agent list is empty", () => {
        expect(
            getAgentSelectionStatus({
                agentSwitchingActive: true,
                agents: [],
            }),
        ).toEqual({
            availableAgents: [],
            hasNoAgents: true,
            isSelectionLoading: false,
        });
    });

    it("should keep selection loading while agent list is unresolved", () => {
        expect(
            getAgentSelectionStatus({
                agentSwitchingActive: true,
                agents: undefined,
            }).isSelectionLoading,
        ).toBe(true);
    });

    it("should keep selection loading until selectedAgentId is set", () => {
        expect(
            getAgentSelectionStatus({
                agentSwitchingActive: true,
                agents: [agent("sales")],
            }).isSelectionLoading,
        ).toBe(true);

        expect(
            getAgentSelectionStatus({
                agentSwitchingActive: true,
                agents: [agent("sales", { lastUsedAt: "2026-01-01T00:00:00Z" })],
            }).isSelectionLoading,
        ).toBe(true);

        expect(
            getAgentSelectionStatus({
                agentSwitchingActive: true,
                agents: [agent("sales")],
                selectedAgentId: "sales",
            }).isSelectionLoading,
        ).toBe(false);
    });

    it("should keep selection loading when selectedAgentId is not in the available list", () => {
        expect(
            getAgentSelectionStatus({
                agentSwitchingActive: true,
                agents: [agent("sales")],
                selectedAgentId: "retired-agent",
            }).isSelectionLoading,
        ).toBe(true);
    });

    it("should keep selection loading while the assistant is still loading", () => {
        expect(
            getAgentSelectionStatus({
                agentSwitchingActive: true,
                assistantLoading: true,
                agents: [agent("sales")],
                selectedAgentId: "sales",
            }).isSelectionLoading,
        ).toBe(true);
    });
});

describe("getEffectiveSelectedAgentId", () => {
    it("should prefer an available conversation agent", () => {
        expect(
            getEffectiveSelectedAgentId({
                agents: [agent("sales"), agent("support")],
                conversationAgentId: "sales",
                selectedAgentId: "support",
            }),
        ).toBe("sales");
    });

    it("should fall back to selected agent when conversation agent is unavailable", () => {
        expect(
            getEffectiveSelectedAgentId({
                agents: [agent("support")],
                conversationAgentId: "retired-agent",
                selectedAgentId: "support",
            }),
        ).toBe("support");
    });

    it("should return undefined when neither candidate is available", () => {
        expect(
            getEffectiveSelectedAgentId({
                agents: [agent("support")],
                conversationAgentId: "retired-agent",
                selectedAgentId: "retired-selected-agent",
            }),
        ).toBeUndefined();
    });
});

function agent(id: string, extra: Partial<GenAIAgent> = {}): GenAIAgent {
    return {
        id,
        title: id,
        ...extra,
    };
}

function conversation(
    id: string,
    agentId: string,
    updatedAt = "2026-01-01T00:00:00Z",
): IChatConversationLocal {
    return {
        id,
        localId: id,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt,
        agentId,
    };
}
