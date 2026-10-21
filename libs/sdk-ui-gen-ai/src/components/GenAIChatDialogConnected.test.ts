// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { setUserContextAction } from "../store/chatWindow/chatWindowSlice.js";
import { type ChatClarificationQuestionsEvent } from "../store/events.js";
import {
    clearThreadAction,
    newMessageAction,
    setSelectedAgentAction,
    setSelectedEffortAction,
} from "../store/messages/messagesSlice.js";

import { type SeedInput, buildSeedActions, toGenAIChatConnectedEvent } from "./GenAIChatDialogConnected.js";

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

describe("buildSeedActions", () => {
    const agent = setSelectedAgentAction.type;
    const clear = clearThreadAction.type;
    const effort = setSelectedEffortAction.type;
    const ctx = setUserContextAction.type;
    const msg = newMessageAction.type;

    it.each<[string, SeedInput, string[], string | undefined]>([
        ["no effort (every other ask)", { askedQuestion: "q" }, [agent, clear, ctx, msg], undefined],
        [
            "Thinking from new dashboard",
            { askedQuestion: "q", effort: "MEDIUM" },
            [agent, clear, effort, ctx, msg],
            "MEDIUM",
        ],
        [
            "Quick from new dashboard",
            { askedQuestion: "q", effort: "LOW" },
            [agent, clear, effort, ctx, msg],
            "LOW",
        ],
        ["unsupported value", { askedQuestion: "q", effort: "HIGH" }, [agent, clear, ctx, msg], undefined],
        [
            "append keeps conversation effort",
            { askedQuestion: "q", effort: "MEDIUM", appendToChat: true },
            [agent, ctx, msg],
            undefined,
        ],
        [
            "context only, no question",
            { askedQuestion: null, userContext: {}, effort: "MEDIUM" },
            [agent, clear, effort, ctx],
            "MEDIUM",
        ],
        ["nothing to seed", { askedQuestion: null, effort: "MEDIUM" }, [ctx], undefined],
    ])("%s", (_name, input, expectedTypes, expectedEffort) => {
        const actions = buildSeedActions(input);

        expect(actions.map((action) => action.type)).toEqual(expectedTypes);
        const effortAction = actions.find(setSelectedEffortAction.match);
        expect(effortAction?.payload.effort).toBe(expectedEffort);
    });
});
