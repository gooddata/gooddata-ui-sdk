// (C) 2024-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { DEFAULT_EFFORT } from "../../../components/utils/effortSelection.js";
import { type IChatConversationLocal } from "../../../model.js";
import { chatWindowSliceReducer } from "../../chatWindow/chatWindowSlice.js";
import { type RootState } from "../../types.js";
import { createEmptyConversation } from "../../utils.js";
import {
    conversationEffortSelector,
    conversationMessagesByIdSelector,
    conversationMessagesSelector,
    hasMessagesSelector,
    lastMessageSelector,
    selectedEffortSelector,
} from "../messagesSelectors.js";
import { messagesSliceReducer } from "../messagesSlice.js";

const baseState: RootState = {
    messages: messagesSliceReducer(undefined, { type: "test/init" }),
    chatWindow: chatWindowSliceReducer(undefined, { type: "test/init" }),
};

const makeState = (messages: RootState["messages"]): RootState => ({
    ...baseState,
    messages,
});

describe("messagesSelectors", () => {
    describe("lastMessageSelector", () => {
        it("should return the last message", () => {
            const state = makeState({
                ...baseState.messages,
                messageOrder: ["1", "2"],
                messages: {
                    "1": {
                        id: "1",
                        localId: "1",
                        created: 1,
                        role: "user",
                        cancelled: false,
                        complete: true,
                        content: [{ type: "text", text: "Hello", objects: [] }],
                    },
                    "2": {
                        id: "2",
                        localId: "2",
                        created: 2,
                        role: "assistant",
                        cancelled: true,
                        complete: true,
                        content: [{ type: "text", text: "Hi there!", objects: [] }],
                        feedback: "NONE",
                    },
                },
            });

            const lastMessage = lastMessageSelector(state);

            expect(lastMessage).toBe(state.messages.messages["2"]);
        });
    });

    describe("hasMessagesSelector", () => {
        it("should return true when message list is not empty", () => {
            const state = makeState({
                ...baseState.messages,
                messageOrder: ["msg-1"],
                messages: {
                    "msg-1": {
                        id: "msg-1",
                        localId: "msg-1",
                        created: 1,
                        role: "user",
                        cancelled: false,
                        complete: true,
                        content: [{ type: "text", text: "Hi", objects: [] }],
                    },
                },
            });

            expect(hasMessagesSelector(state)).toBe(true);
        });

        it("should return true when current conversation has items in conversationsData", () => {
            const state = makeState({
                ...baseState.messages,
                currentConversation: {
                    id: "conversation-1",
                    localId: "conversation-1",
                    title: "Conversation",
                    createdAt: new Date(1).toISOString(),
                    updatedAt: new Date(1).toISOString(),
                },
                conversationsData: {
                    "conversation-1": {
                        order: ["item-1"],
                        items: {
                            "item-1": {
                                id: "item-1",
                                localId: "item-1",
                                complete: true,
                                role: "assistant",
                                createdAt: 1,
                                type: "item",
                                content: { type: "text", text: "Result" },
                                responseId: "item-1,",
                            },
                        },
                    },
                },
            });

            expect(hasMessagesSelector(state)).toBe(true);
        });

        it("should return false when current conversation is new", () => {
            const state = makeState({
                ...baseState.messages,
                currentConversation: createEmptyConversation(),
            });

            expect(hasMessagesSelector(state)).toBe(false);
        });
    });

    describe("conversationMessagesSelector", () => {
        it("should return current conversation items from conversationsData", () => {
            const state = makeState({
                ...baseState.messages,
                currentConversation: {
                    id: "conversation-1",
                    title: "Conversation",
                    localId: "conversation-1",
                    createdAt: new Date(1).toISOString(),
                    updatedAt: new Date(1).toISOString(),
                },
                conversationsData: {
                    "conversation-1": {
                        order: ["item-1", "item-2"],
                        items: {
                            "item-1": {
                                id: "item-1",
                                localId: "item-1",
                                complete: true,
                                createdAt: 1,
                                role: "user",
                                type: "item",
                                content: { type: "text", text: "Question", objects: [] },
                                responseId: "item-1",
                            },
                            "item-2": {
                                id: "item-2",
                                localId: "item-2",
                                complete: true,
                                createdAt: 2,
                                role: "assistant",
                                type: "item",
                                content: { type: "text", text: "Answer", objects: [] },
                                responseId: "item-1",
                            },
                        },
                    },
                },
            });

            expect(conversationMessagesSelector(state).map((item) => item.localId)).toEqual([
                "item-1",
                "item-2",
            ]);
        });

        it("should return an empty list when current conversation is undefined", () => {
            expect(conversationMessagesSelector(baseState)).toEqual([]);
        });
    });

    describe("conversationMessagesByIdSelector", () => {
        it("should return items for the provided conversation id", () => {
            const state = makeState({
                ...baseState.messages,
                conversationsData: {
                    "conversation-2": {
                        order: ["item-3"],
                        items: {
                            "item-3": {
                                id: "item-3",
                                localId: "item-3",
                                complete: true,
                                createdAt: 3,
                                role: "assistant",
                                type: "item",
                                content: { type: "text", text: "From id selector", objects: [] },
                                responseId: "item-1",
                            },
                        },
                    },
                },
            });

            expect(conversationMessagesByIdSelector(state, "conversation-2")).toEqual([
                state.messages.conversationsData["conversation-2"].items["item-3"],
            ]);
        });

        it("should return an empty list when conversation id is missing", () => {
            expect(conversationMessagesByIdSelector(baseState, undefined)).toEqual([]);
        });

        it("should return an empty list when conversation id does not exist", () => {
            expect(conversationMessagesByIdSelector(baseState, "unknown-conversation")).toEqual([]);
        });
    });

    describe("selectedEffortSelector", () => {
        const conversation = (localId: string): IChatConversationLocal => ({
            id: localId,
            localId,
            title: localId,
            createdAt: new Date(1).toISOString(),
            updatedAt: new Date(1).toISOString(),
        });

        it("should return the effort recorded for the current conversation", () => {
            const state = makeState({
                ...baseState.messages,
                currentConversation: conversation("conversation-1"),
                conversationsData: {
                    "conversation-1": { order: [], items: {}, reasoningEffort: "LOW" },
                },
            });

            expect(selectedEffortSelector(state)).toBe("LOW");
        });

        it("should return the default for a conversation with nothing recorded", () => {
            const state = makeState({
                ...baseState.messages,
                currentConversation: createEmptyConversation(),
            });

            expect(selectedEffortSelector(state)).toBe(DEFAULT_EFFORT);
        });

        it("should not leak one conversation's effort into another", () => {
            const conversationsData = {
                "conversation-1": { order: [], items: {}, reasoningEffort: "LOW" as const },
                "conversation-2": { order: [], items: {} },
            };

            const onFirst = makeState({
                ...baseState.messages,
                currentConversation: conversation("conversation-1"),
                conversationsData,
            });
            const onSecond = makeState({
                ...baseState.messages,
                currentConversation: conversation("conversation-2"),
                conversationsData,
            });

            expect(selectedEffortSelector(onFirst)).toBe("LOW");
            expect(selectedEffortSelector(onSecond)).toBe(DEFAULT_EFFORT);
        });

        it("should fall back to the global value in the legacy single-thread mode", () => {
            const state = makeState({
                ...baseState.messages,
                currentConversation: undefined,
                selectedEffort: "LOW",
            });

            expect(selectedEffortSelector(state)).toBe("LOW");
        });
    });

    describe("conversationEffortSelector", () => {
        it("should read the keyed conversation, not whichever one is current", () => {
            const state = makeState({
                ...baseState.messages,
                currentConversation: createEmptyConversation(),
                conversationsData: {
                    "conversation-1": { order: [], items: {}, reasoningEffort: "LOW" },
                },
            });

            expect(conversationEffortSelector(state, "conversation-1")).toBe("LOW");
            expect(conversationEffortSelector(state, "unknown-conversation")).toBe(DEFAULT_EFFORT);
            expect(conversationEffortSelector(state, undefined)).toBe(DEFAULT_EFFORT);
        });
    });
});
