// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type GenAIAgent, type IChatConversationLocal } from "../../model.js";

import {
    getAgentSelectionStatus,
    getAgentSelectionUpdate,
    getEffectiveSelectedAgentId,
    getStandaloneSelectedAgentId,
    selectDefaultAgentId,
} from "./agentSelection.js";

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
                conversationsLoading: false,
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
                conversationsLoading: false,
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
                conversationsLoading: false,
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

describe("getAgentSelectionUpdate", () => {
    const agents = [
        agent("sales", { modifiedAt: "2026-01-01T00:00:00Z" }),
        agent("support", { modifiedAt: "2026-02-01T00:00:00Z" }),
    ];

    it.each([
        { conversationAgentId: "sales", selectedAgentId: "support", expected: { agentId: "sales" } },
        { conversationAgentId: "sales", selectedAgentId: "sales", expected: undefined },
        { conversationAgentId: "sales", selectedAgentId: undefined, expected: { agentId: "sales" } },
        { conversationAgentId: "retired", selectedAgentId: "sales", expected: { agentId: "sales" } },
        { conversationAgentId: "retired", selectedAgentId: "missing", expected: { agentId: "support" } },
        { conversationAgentId: "retired", selectedAgentId: undefined, expected: { agentId: "support" } },
        { conversationAgentId: undefined, selectedAgentId: "sales", expected: undefined },
        { conversationAgentId: undefined, selectedAgentId: "missing", expected: { agentId: "support" } },
        { conversationAgentId: undefined, selectedAgentId: undefined, expected: { agentId: "support" } },
        { conversationAgentId: "", selectedAgentId: "", expected: { agentId: "support" } },
    ])("resolves the existing reconciliation decision: %j", ({ expected, ...selection }) => {
        expect(getAgentSelectionUpdate({ agents, ...selection })).toEqual(expected);
    });

    it.each([undefined, "sales"])(
        "does nothing without agents for conversation agent %s",
        (conversationAgentId) => {
            expect(
                getAgentSelectionUpdate({ agents: [], conversationAgentId, selectedAgentId: "sales" }),
            ).toBeUndefined();
        },
    );

    it("uses available history without mutating either input list", () => {
        const conversations = [
            conversation("older", "support", "2026-01-01T00:00:00Z"),
            conversation("newer", "sales", "2026-02-01T00:00:00Z"),
        ];
        const before = structuredClone({ agents, conversations });

        expect(getAgentSelectionUpdate({ agents, conversations })).toEqual({ agentId: "sales" });
        expect({ agents, conversations }).toEqual(before);
    });

    it("keeps metadata precedence when history is available", () => {
        expect(
            getAgentSelectionUpdate({
                agents: [agents[0], { ...agents[1], lastUsedAt: "2026-03-01T00:00:00Z" }],
                conversations: [conversation("previous", "sales")],
            }),
        ).toEqual({ agentId: "support" });
    });
});

describe("getStandaloneSelectedAgentId", () => {
    const agents = [agent("sales"), agent("support", { lastUsedAt: "2026-03-01T00:00:00Z" })];

    it.each([
        { agents: undefined, selectedAgentId: "sales", expected: undefined },
        { agents: [], selectedAgentId: "sales", expected: undefined },
        { agents, selectedAgentId: "support", expected: "support" },
        { agents, selectedAgentId: "sales", expected: "sales" },
        { agents, selectedAgentId: "retired", expected: "sales" },
        { agents, selectedAgentId: undefined, expected: "sales" },
        { agents: [agent("sales"), agent("")], selectedAgentId: "", expected: "" },
    ])("keeps a valid selection or uses list order, not metadata: %j", ({ expected, ...selection }) => {
        expect(getStandaloneSelectedAgentId(selection)).toBe(expected);
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
