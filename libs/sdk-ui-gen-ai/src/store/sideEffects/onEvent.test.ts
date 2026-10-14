// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { type IChatConversationLocalContent, type IChatConversationLocalItem } from "../../model.js";
import { type ChatEvent } from "../events.js";
import {
    evaluateMessageCompleteAction,
    evaluateMessageStreamingAction,
    filledFormAction,
} from "../messages/messagesSlice.js";

import {
    onClarificationQuestionsAnswered,
    onEvaluateMessageComplete,
    onEvaluateMessageStreaming,
} from "./onEvent.js";

vi.mock("../messages/messagesSelectors.js", () => ({
    conversationMessagesSelector: (state: TestState) => state.messages,
    threadIdSelector: (state: TestState) => state.threadId,
}));

type TestState = {
    messages: IChatConversationLocalItem[];
    threadId: string;
};

const clarificationMessage = {
    id: "interaction-id",
    localId: "local-id",
    role: "assistant",
    content: {
        type: "multipart",
        parts: [
            {
                type: "clarifyingQuestions",
                questions: [
                    {
                        text: "Which region?",
                        control: {
                            options: [{ text: "East" }, { text: "West" }],
                        },
                    },
                ],
            },
        ],
    },
} as IChatConversationLocalItem;

const state: TestState = {
    messages: [clarificationMessage],
    threadId: "thread-id",
};

describe("clarification question events", () => {
    it("emits presentation before an answer and does not emit it again on completion", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const sagaOptions = {
            context: { eventDispatcher: { dispatch } },
            getState: () => state,
        };

        await runSaga(
            sagaOptions,
            onEvaluateMessageStreaming,
            evaluateMessageStreamingAction({
                assistantMessageId: clarificationMessage.localId,
                content: clarificationMessage.content as IChatConversationLocalContent,
                interactionId: clarificationMessage.id,
            }),
        ).toPromise();
        await runSaga(
            sagaOptions,
            onClarificationQuestionsAnswered,
            filledFormAction({
                assistantMessageId: clarificationMessage.localId,
                responses: { "Which region?": "East" },
            }),
        ).toPromise();
        await runSaga(
            sagaOptions,
            onEvaluateMessageComplete,
            evaluateMessageCompleteAction({ assistantMessageId: clarificationMessage.localId }),
        ).toPromise();

        expect(dispatch).toHaveBeenNthCalledWith(1, {
            type: "chatClarificationQuestions",
            interactionId: "interaction-id",
            threadId: "thread-id",
            questions: [
                {
                    text: "Which region?",
                    control: {
                        type: "singleChoice",
                        options: [{ text: "East" }, { text: "West" }],
                    },
                },
            ],
        });
        expect(dispatch).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                type: "chatClarificationQuestions",
                responses: { "Which region?": "East" },
            }),
        );
        expect(dispatch).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                type: "chatAssistantMessage",
            }),
        );
        expect(dispatch).toHaveBeenCalledTimes(3);
    });

    it.each([
        ["submitted", { "Which region?": "East" }],
        ["cancelled", null],
    ])("emits %s responses", async (_state, responses) => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();

        await runSaga(
            {
                context: { eventDispatcher: { dispatch } },
                getState: () => state,
            },
            onClarificationQuestionsAnswered,
            filledFormAction({
                assistantMessageId: clarificationMessage.localId,
                responses,
            }),
        ).toPromise();

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "chatClarificationQuestions",
                interactionId: "interaction-id",
                responses,
            }),
        );
    });
});
