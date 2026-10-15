// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ChatClarificationQuestionsEvent } from "@gooddata/sdk-ui-gen-ai";

import { toHostGenAIChatEvent } from "./GenAIChat.js";

describe("toHostGenAIChatEvent", () => {
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
