// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ChatClarificationQuestionsEvent } from "../store/events.js";

import { toGenAIChatConnectedEvent } from "./GenAIChatDialogConnected.js";

describe("toGenAIChatConnectedEvent", () => {
    it("normalizes clarification question lifecycle events", () => {
        const event: ChatClarificationQuestionsEvent = {
            type: "chatClarificationQuestions",
            interactionId: "interaction-1",
            questions: [],
        };

        expect(toGenAIChatConnectedEvent(event)).toEqual({
            name: "clarification-questions",
            payload: event,
        });
    });
});
