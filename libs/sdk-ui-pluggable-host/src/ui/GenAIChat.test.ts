// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type ChatClarificationQuestionsEvent,
    type ChatConversationChangedEvent,
    type ChatReasoningEvent,
} from "@gooddata/sdk-ui-gen-ai";

import { toHostGenAIChatEvent } from "./GenAIChat.js";

describe("toHostGenAIChatEvent", () => {
    it.each(["Choosing visualizations", undefined])("forwards reasoning title %s unchanged", (title) => {
        const event: ChatReasoningEvent = { type: "chatReasoning", threadId: "thread-1", title };
        const forwarded = toHostGenAIChatEvent({ name: "reasoning", payload: event });

        expect(forwarded).toEqual({ name: "chat.reasoning", payload: event });
        expect(forwarded?.payload).toBe(event);
    });

    it("forwards conversation changes for reasoning cleanup", () => {
        const event: ChatConversationChangedEvent = {
            type: "chatConversationChanged",
            conversation: {
                id: "thread-1",
                localId: "conversation-1",
                title: "Dashboard",
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-01T00:00:00Z",
            },
        };

        expect(toHostGenAIChatEvent({ name: "conversation-changed", payload: event })).toEqual({
            name: "chat.conversation-changed",
            payload: event,
        });
    });

    it("forwards clarification question lifecycle events to the active application", () => {
        const event: ChatClarificationQuestionsEvent = {
            type: "chatClarificationQuestions",
            interactionId: "interaction-1",
            questions: [],
        };

        expect(toHostGenAIChatEvent({ name: "clarification-questions", payload: event })).toEqual({
            name: "chat.clarification-questions",
            payload: event,
        });
    });
});
