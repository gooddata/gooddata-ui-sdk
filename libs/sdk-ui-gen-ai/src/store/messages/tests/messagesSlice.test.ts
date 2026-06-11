// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IChatConversationLocal } from "../../../model.js";
import { finishAgentSwitchAction, messagesSliceReducer, setSelectedAgentAction } from "../messagesSlice.js";

describe("messagesSlice", () => {
    it("should append an optimistic agent switch item to an empty conversation", () => {
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
        expect(data.order).toHaveLength(1);

        const item = data.items[data.order[0]];
        expect(item).toEqual(
            expect.objectContaining({
                id: "",
                role: "system",
                agentId: "silver",
                oldAgentId: "gold",
                content: { type: "system" },
            }),
        );
    });

    it("should block input while persisting an explicit agent switch", () => {
        const conversation: IChatConversationLocal = {
            id: "conversation-1",
            localId: "conversation-1",
            title: "Conversation",
            createdAt: new Date(1).toISOString(),
            updatedAt: new Date(1).toISOString(),
            agentId: "gold",
        };

        const switchingState = messagesSliceReducer(
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

        expect(switchingState.conversationsData[conversation.localId].asyncProcess).toBe("switchingAgent");

        const finishedState = messagesSliceReducer(
            switchingState,
            finishAgentSwitchAction({ conversationLocalId: conversation.localId }),
        );

        expect(finishedState.conversationsData[conversation.localId].asyncProcess).toBeUndefined();
    });
});
