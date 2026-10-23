// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { setHistoryAction, setUserContextAction } from "../store/chatWindow/chatWindowSlice.js";
import {
    type ChatClarificationQuestionsEvent,
    type ChatConversationChangedEvent,
    type ChatReasoningEvent,
    isChatReasoningEvent,
} from "../store/events.js";
import {
    activateConversationAction,
    clearThreadAction,
    newMessageAction,
    setSelectedAgentAction,
    setSelectedEffortAction,
} from "../store/messages/messagesSlice.js";

import { type SeedInput, buildSeedActions, toGenAIChatConnectedEvent } from "./GenAIChatDialogConnected.js";

describe("toGenAIChatConnectedEvent", () => {
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

        expect(toGenAIChatConnectedEvent(event)).toEqual({ name: "conversation-changed", payload: event });
    });

    it.each(["Choosing visualizations", undefined])("forwards reasoning title %s unchanged", (title) => {
        const event: ChatReasoningEvent = {
            type: "chatReasoning",
            threadId: "thread-1",
            interactionId: "interaction-1",
            title,
        };

        const connected = toGenAIChatConnectedEvent(event);
        expect(isChatReasoningEvent(event)).toBe(true);
        expect(isChatReasoningEvent({ type: "chatOpened" })).toBe(false);
        expect(connected).toEqual({ name: "reasoning", payload: event });
        expect(connected?.payload).toBe(event);
    });

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
    it("activates an existing conversation without clearing it or replaying a seeded question", () => {
        expect(
            buildSeedActions({
                conversationId: "conversation-1",
                askedQuestion: "stale question",
                userContext: {},
            }),
        ).toEqual([
            activateConversationAction({ conversationId: "conversation-1" }),
            setHistoryAction({ isHistory: false }),
        ]);
    });

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
