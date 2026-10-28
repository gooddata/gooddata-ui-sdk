// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import {
    type IChatConversationLocalContent,
    type IChatConversationLocalItem,
    makeUserItem,
} from "../../model.js";
import { type ChatEvent } from "../events.js";
import {
    evaluateMessageCompleteAction,
    evaluateMessageStreamingAction,
    filledFormAction,
    newMessageAction,
} from "../messages/messagesSlice.js";

import {
    onClarificationQuestionsAnswered,
    onEvaluateMessageComplete,
    onEvaluateMessageStreaming,
    onNewMessage,
} from "./onEvent.js";

vi.mock("../messages/messagesSelectors.js", () => ({
    conversationMessagesSelector: (state: TestState) => state.messages,
    conversationMessagesByIdSelector: (state: TestState, conversationId: string) =>
        state.messagesByConversation?.[conversationId] ?? [],
    conversationByIdOrLocalIdSelector: (state: TestState, conversationId: string) =>
        state.conversations?.find((conversation) => conversation.localId === conversationId),
    threadIdSelector: (state: TestState) => state.threadId,
}));

type TestState = {
    messages: IChatConversationLocalItem[];
    threadId: string;
    messagesByConversation?: Record<string, IChatConversationLocalItem[]>;
    conversations?: { id: string; localId: string }[];
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
    messagesByConversation: { "thread-id": [clarificationMessage] },
};

describe("clarification question events", () => {
    it("reports questions from the originating conversation even when another one is active", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const backgroundState: TestState = {
            messages: [],
            threadId: "unrelated-thread",
            messagesByConversation: { "local-conversation": [clarificationMessage] },
            conversations: [{ id: "origin-thread", localId: "local-conversation" }],
        };

        await runSaga(
            {
                context: { eventDispatcher: { dispatch } },
                getState: () => backgroundState,
            },
            onEvaluateMessageStreaming,
            evaluateMessageStreamingAction({
                assistantMessageId: clarificationMessage.localId,
                conversationId: "local-conversation",
            }),
        ).toPromise();

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "chatClarificationQuestions",
                threadId: "origin-thread",
                interactionId: clarificationMessage.id,
            }),
        );
    });

    it("emits structured user answers", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const answers = [
            {
                questionIndex: 0,
                questionText: "Which region?",
                answer: {
                    type: "singleChoice" as const,
                    optionIndex: 1,
                    optionText: "West",
                },
            },
            {
                questionIndex: 2,
                questionText: "Which year?",
                answer: {
                    type: "singleChoice" as const,
                    optionIndex: 0,
                    optionText: "2026",
                },
            },
        ];

        await runSaga(
            {
                context: { eventDispatcher: { dispatch } },
                getState: () => state,
            },
            onNewMessage,
            newMessageAction(
                makeUserItem({
                    type: "clarifyingAnswers",
                    questionsItemId: clarificationMessage.id,
                    answers,
                }),
            ),
        ).toPromise();

        expect(dispatch).toHaveBeenCalledWith({
            type: "chatUserAnswers",
            threadId: "thread-id",
            interactionId: "interaction-id",
            answers,
        });
    });

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
                conversationId: "thread-id",
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
            evaluateMessageCompleteAction({
                assistantMessageId: clarificationMessage.localId,
                conversationId: "thread-id",
            }),
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

describe("assistant message events", () => {
    it.each([false, true])(
        "emits completion after the active conversation switches (cancelled: %s)",
        async (cancelled) => {
            const dispatch = vi.fn<(event: ChatEvent) => void>();
            const backgroundState: TestState = {
                messages: [],
                threadId: "unrelated-thread",
                messagesByConversation: { "local-conversation": [clarificationMessage] },
                conversations: [{ id: "origin-thread", localId: "local-conversation" }],
            };

            await runSaga(
                {
                    context: { eventDispatcher: { dispatch } },
                    getState: () => backgroundState,
                },
                onEvaluateMessageComplete,
                evaluateMessageCompleteAction({
                    assistantMessageId: clarificationMessage.localId,
                    conversationId: "local-conversation",
                    cancelled,
                }),
            ).toPromise();

            expect(dispatch).toHaveBeenCalledExactlyOnceWith({
                type: "chatAssistantMessage",
                interactionId: clarificationMessage.id,
                useCase: "GENERAL",
                skills: undefined,
                threadId: "origin-thread",
                ...(cancelled ? { cancelled: true } : {}),
            });
        },
    );

    it("emits cancellation so dashboard builds can be unlocked", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const message = {
            id: "interaction-id",
            localId: "local-id",
            role: "assistant",
            content: { type: "text", text: "Working" },
        } as IChatConversationLocalItem;

        await runSaga(
            {
                context: { eventDispatcher: { dispatch } },
                getState: () => ({
                    messages: [message],
                    threadId: "thread-id",
                    messagesByConversation: { "thread-id": [message] },
                }),
            },
            onEvaluateMessageComplete,
            evaluateMessageCompleteAction({
                assistantMessageId: message.localId,
                conversationId: "thread-id",
                cancelled: true,
            }),
        ).toPromise();

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: "chatAssistantMessage", cancelled: true }),
        );
    });

    it("marks the final assistant event when the response completed successfully", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const message = {
            id: "interaction-id",
            localId: "local-id",
            role: "assistant",
            content: { type: "text", text: "Please approve this" },
        } as IChatConversationLocalItem;

        await runSaga(
            {
                context: { eventDispatcher: { dispatch } },
                getState: () => ({
                    messages: [message],
                    threadId: "thread-id",
                    messagesByConversation: { "thread-id": [message] },
                }),
            },
            onEvaluateMessageComplete,
            evaluateMessageCompleteAction({
                assistantMessageId: message.localId,
                conversationId: "thread-id",
                responseCompleted: true,
            }),
        ).toPromise();

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: "chatAssistantMessage", responseCompleted: true }),
        );
    });

    it("does not mark an error message as a successful response completion", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const message = {
            id: "interaction-id",
            localId: "local-id",
            role: "assistant",
            content: { type: "error", message: "Failed" },
        } as unknown as IChatConversationLocalItem;

        await runSaga(
            {
                context: { eventDispatcher: { dispatch } },
                getState: () => ({
                    messages: [message],
                    threadId: "thread-id",
                    messagesByConversation: { "thread-id": [message] },
                }),
            },
            onEvaluateMessageComplete,
            evaluateMessageCompleteAction({
                assistantMessageId: message.localId,
                conversationId: "thread-id",
                responseCompleted: true,
            }),
        ).toPromise();

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: "chatAssistantMessage", useCase: "INVALID" }),
        );
        expect(dispatch.mock.calls[0][0]).not.toHaveProperty("responseCompleted");
    });

    it("emits activated skills", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const skills = [
            { name: "create_visualization", title: "Create visualization" },
            { name: "forecast", title: "Forecast" },
        ];
        const skillActivatedMessage = {
            id: "interaction-id",
            localId: "local-id",
            role: "assistant",
            content: {
                type: "skillsActivated",
                skills,
            },
        } as IChatConversationLocalItem;

        await runSaga(
            {
                context: { eventDispatcher: { dispatch } },
                getState: () => ({
                    messages: [skillActivatedMessage],
                    threadId: "thread-id",
                    messagesByConversation: { "thread-id": [skillActivatedMessage] },
                }),
            },
            onEvaluateMessageComplete,
            evaluateMessageCompleteAction({
                assistantMessageId: skillActivatedMessage.localId,
                conversationId: "thread-id",
            }),
        ).toPromise();

        expect(dispatch).toHaveBeenCalledWith({
            type: "chatAssistantMessage",
            interactionId: "interaction-id",
            useCase: "GENERAL",
            threadId: "thread-id",
            skills,
        });
    });
});
