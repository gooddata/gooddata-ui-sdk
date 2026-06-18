// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IChatConversationLocal, makeUserItem } from "../../../model.js";
import {
    applyPendingAgentSwitchAction,
    messagesSliceReducer,
    setSelectedAgentAction,
} from "../messagesSlice.js";

describe("messagesSlice", () => {
    it("should store a pending agent switch without adding an item or blocking input", () => {
        const conversation: IChatConversationLocal = {
            id: "conversation-1",
            localId: "conversation-1",
            title: "Conversation",
            createdAt: new Date(1).toISOString(),
            updatedAt: new Date(1).toISOString(),
            agentId: "gold",
        };

        const state = messagesSliceReducer(
            {
                ...messagesSliceReducer(undefined, { type: "test/init" }),
                currentConversation: conversation,
                conversations: [conversation],
                conversationsData: {},
            },
            setSelectedAgentAction({
                agentId: "silver",
                showChangeEvent: true,
            }),
        );

        const data = state.conversationsData[conversation.localId];
        expect(data.order).toHaveLength(0);
        expect(data.asyncProcess).toBeUndefined();
        expect(data.pendingAgentSwitch).toEqual({ agentId: "silver", previousAgentId: "gold" });
    });

    it("should preserve the original previousAgentId when the agent is switched again before sending", () => {
        const conversation: IChatConversationLocal = {
            id: "conversation-1",
            localId: "conversation-1",
            title: "Conversation",
            createdAt: new Date(1).toISOString(),
            updatedAt: new Date(1).toISOString(),
            agentId: "gold",
        };

        const base = {
            ...messagesSliceReducer(undefined, { type: "test/init" }),
            currentConversation: conversation,
            conversations: [conversation],
            conversationsData: {},
        };

        const afterFirst = messagesSliceReducer(
            base,
            setSelectedAgentAction({ agentId: "silver", showChangeEvent: true }),
        );
        const afterSecond = messagesSliceReducer(
            afterFirst,
            setSelectedAgentAction({ agentId: "bronze", showChangeEvent: true }),
        );

        const data = afterSecond.conversationsData[conversation.localId];
        expect(data.pendingAgentSwitch).toEqual({ agentId: "bronze", previousAgentId: "gold" });
    });

    it("should clear the pending switch when switching back to the original BE-confirmed agent", () => {
        const conversation: IChatConversationLocal = {
            id: "conversation-1",
            localId: "conversation-1",
            title: "Conversation",
            createdAt: new Date(1).toISOString(),
            updatedAt: new Date(1).toISOString(),
            agentId: "gold",
        };

        const base = {
            ...messagesSliceReducer(undefined, { type: "test/init" }),
            currentConversation: conversation,
            conversations: [conversation],
            conversationsData: {},
        };

        const afterAtoB = messagesSliceReducer(
            base,
            setSelectedAgentAction({ agentId: "silver", showChangeEvent: true }),
        );
        const afterBtoA = messagesSliceReducer(
            afterAtoB,
            setSelectedAgentAction({ agentId: "gold", showChangeEvent: true }),
        );

        const data = afterBtoA.conversationsData[conversation.localId];
        expect(data.pendingAgentSwitch).toBeUndefined();
    });

    it("should insert the optimistic agent switch item before the user message", () => {
        const conversation: IChatConversationLocal = {
            id: "conversation-1",
            localId: "conversation-1",
            title: "Conversation",
            createdAt: new Date(1).toISOString(),
            updatedAt: new Date(1).toISOString(),
            agentId: "gold",
        };

        const userMessage = makeUserItem({ type: "text", text: "hello", objects: [] });
        const base = {
            ...messagesSliceReducer(undefined, { type: "test/init" }),
            currentConversation: conversation,
            conversations: [conversation],
            conversationsData: {
                [conversation.localId]: {
                    items: { [userMessage.localId]: userMessage },
                    order: [userMessage.localId],
                },
            },
        };

        const pendingState = messagesSliceReducer(
            base,
            setSelectedAgentAction({ agentId: "silver", showChangeEvent: true }),
        );
        const appliedState = messagesSliceReducer(
            pendingState,
            applyPendingAgentSwitchAction({
                conversationLocalId: conversation.localId,
                beforeItemLocalId: userMessage.localId,
            }),
        );

        const data = appliedState.conversationsData[conversation.localId];
        expect(data.pendingAgentSwitch).toBeUndefined();
        expect(data.order).toHaveLength(2);
        // switch item must come before the user message
        expect(data.items[data.order[0]]).toEqual(
            expect.objectContaining({
                id: "",
                role: "system",
                agentId: "silver",
                oldAgentId: "gold",
                content: { type: "system" },
            }),
        );
        expect(data.order[1]).toBe(userMessage.localId);
    });
});
