// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import {
    type GenAIAgent,
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
    saveVisualizationErrorAction,
    saveVisualizationSuccessAction,
} from "../messages/messagesSlice.js";

import {
    onClarificationQuestionsAnswered,
    onEvaluateMessageComplete,
    onEvaluateMessageStreaming,
    onNewMessage,
    onSaveVisualizationError,
    onSaveVisualizationSuccess,
} from "./onEvent.js";

vi.mock("../messages/messagesSelectors.js", () => ({
    agentsSelector: (state: TestState) => state.agents,
    selectedAgentIdSelector: (state: TestState) => state.selectedAgentId,
    conversationMessagesSelector: (state: TestState) => state.messages,
    conversationMessagesByIdSelector: (state: TestState, conversationId: string) =>
        state.messagesByConversation?.[conversationId] ?? [],
    conversationByIdOrLocalIdSelector: (state: TestState, conversationId: string) =>
        state.conversations?.find(
            (conversation) => conversation.localId === conversationId || conversation.id === conversationId,
        ),
    conversationSelector: (state: TestState) => state.conversations?.[0],
    threadIdSelector: (state: TestState) => state.threadId,
}));

type TestState = {
    messages: IChatConversationLocalItem[];
    threadId: string;
    messagesByConversation?: Record<string, IChatConversationLocalItem[]>;
    conversations?: { id: string; localId: string; agentId?: string }[];
    agents?: GenAIAgent[];
    selectedAgentId?: string;
};

describe.each(["success", "error"] as const)("visualization save %s events", (outcome) => {
    const origin = { id: "origin-thread", localId: "origin-local" };
    const selected = { id: "selected-thread", localId: "selected-local" };

    it.each([
        {
            name: "originating conversation in the background",
            conversationId: origin.localId,
            conversations: [selected, origin],
            expectedThreadId: origin.id,
        },
        {
            name: "originating conversation still selected",
            conversationId: origin.localId,
            conversations: [origin],
            expectedThreadId: origin.id,
        },
        {
            name: "unknown originating conversation",
            conversationId: "unknown-origin",
            conversations: [selected, origin],
            expectedThreadId: undefined,
        },
        {
            name: "missing originating conversation ID",
            conversationId: undefined,
            conversations: [selected, origin],
            expectedThreadId: "selected-thread",
        },
        {
            name: "empty originating conversation ID",
            conversationId: "",
            conversations: [{ ...selected, localId: "" }, origin],
            expectedThreadId: "selected-thread",
        },
        {
            name: "originating conversation without a server ID",
            conversationId: origin.localId,
            conversations: [selected, { ...origin, id: "" }],
            expectedThreadId: undefined,
        },
        {
            name: "no conversation metadata",
            conversationId: origin.localId,
            conversations: [],
            expectedThreadId: undefined,
        },
    ])(
        "uses only the origin's server ID with $name",
        async ({ conversationId, conversations, expectedThreadId }) => {
            const dispatch = vi.fn<(event: ChatEvent) => void>();
            const options = {
                context: { eventDispatcher: { dispatch } },
                getState: (): TestState => ({
                    messages: [],
                    threadId: "stale-global-thread",
                    conversations,
                }),
            };
            const payload = {
                assistantMessageId: "assistant-message-id",
                visualizationId: "draft-visualization-id",
                conversationId,
            };
            const error = { name: "SaveError", message: "Could not save visualization" };

            if (outcome === "success") {
                await runSaga(
                    options,
                    onSaveVisualizationSuccess,
                    saveVisualizationSuccessAction({
                        ...payload,
                        savedVisualizationId: "saved-visualization-id",
                        explore: false,
                    }),
                ).toPromise();
            } else {
                await runSaga(
                    options,
                    onSaveVisualizationError,
                    saveVisualizationErrorAction({ ...payload, error }),
                ).toPromise();
            }

            expect(dispatch).toHaveBeenCalledExactlyOnceWith(
                outcome === "success"
                    ? {
                          type: "chatSaveVisualizationSuccess",
                          threadId: expectedThreadId,
                          savedVisualizationId: "saved-visualization-id",
                      }
                    : {
                          type: "chatSaveVisualizationError",
                          threadId: expectedThreadId,
                          errorMessage: error.message,
                          errorType: error.name,
                      },
            );
        },
    );
});

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

describe("user message events", () => {
    describe.each(["text", "clarifyingAnswers"] as const)("%s conversation identity", (type) => {
        it.each([
            { id: "", expectedThreadId: undefined },
            { id: "current-thread", expectedThreadId: "current-thread" },
        ])("does not reuse the previous thread for conversation '$id'", async ({ id, expectedThreadId }) => {
            const dispatch = vi.fn<(event: ChatEvent) => void>();
            const conversation = { id, localId: "new-local-conversation" };

            await runSaga(
                {
                    context: { eventDispatcher: { dispatch } },
                    getState: () => ({
                        ...state,
                        threadId: "previous-thread",
                        conversations: [conversation],
                    }),
                },
                onNewMessage,
                newMessageAction(
                    makeUserItem(
                        type === "text"
                            ? { type, text: "Explain my data" }
                            : { type, questionsItemId: "questions", answers: [] },
                    ),
                ),
            ).toPromise();

            expect(dispatch).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    type: type === "text" ? "chatUserMessage" : "chatUserAnswers",
                    conversationId: conversation.localId,
                    threadId: expectedThreadId,
                }),
            );
        });
    });

    it.each(["text", "clarifyingAnswers"] as const)(
        "includes the stable local conversation ID for %s before a server thread exists",
        async (type) => {
            const dispatch = vi.fn<(event: ChatEvent) => void>();
            const conversation = { id: "", localId: "local-conversation" };

            await runSaga(
                {
                    context: { eventDispatcher: { dispatch } },
                    getState: () => ({ ...state, threadId: undefined, conversations: [conversation] }),
                },
                onNewMessage,
                newMessageAction(
                    makeUserItem(
                        type === "text"
                            ? { type, text: "Edit this dashboard" }
                            : { type, questionsItemId: "questions", answers: [] },
                    ),
                ),
            ).toPromise();

            expect(dispatch).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    type: type === "text" ? "chatUserMessage" : "chatUserAnswers",
                    conversationId: conversation.localId,
                    threadId: undefined,
                }),
            );
        },
    );
});

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
                threadId: "thread-id",
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
                threadId: "thread-id",
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
    describe.each(["completion", "streaming"] as const)("%s agent details", (kind) => {
        const supportedAgent: GenAIAgent = {
            id: "dashboard-agent",
            title: "Dashboard agent",
            description: "Builds and edits dashboards",
            effectiveSkills: ["dashboard_builder", "dashboard_editor"],
        };
        const unsupportedAgent: GenAIAgent = {
            id: "other-agent",
            title: "Other agent",
            effectiveSkills: ["alert"],
        };
        const origin = { id: "origin-thread", localId: "origin-local", agentId: supportedAgent.id };
        const selected = { id: "selected-thread", localId: "selected-local", agentId: unsupportedAgent.id };

        it.each<{
            name: string;
            conversationId?: string;
            conversations?: TestState["conversations"];
            agents?: GenAIAgent[];
            selectedAgentId?: string;
            agentId?: string;
            expectedAgent: GenAIAgent | undefined;
        }>([
            { name: "agent with dashboard skills", expectedAgent: supportedAgent },
            {
                name: "agent without dashboard skills",
                agentId: unsupportedAgent.id,
                conversations: [{ ...origin, agentId: unsupportedAgent.id }],
                selectedAgentId: supportedAgent.id,
                expectedAgent: unsupportedAgent,
            },
            {
                name: "unknown responding agent",
                agentId: "unknown-agent",
                conversations: [{ ...origin, agentId: "unknown-agent" }],
                expectedAgent: undefined,
            },
            { name: "unloaded agents", agents: undefined, expectedAgent: undefined },
            { name: "empty agents", agents: [], expectedAgent: undefined },
            {
                name: "selected conversation without an agent ID",
                agentId: unsupportedAgent.id,
                conversations: [{ ...origin, agentId: undefined }],
                expectedAgent: unsupportedAgent,
            },
            {
                name: "no origin with a selected conversation agent",
                conversationId: undefined,
                expectedAgent: supportedAgent,
            },
            {
                name: "no origin or selected conversation",
                agentId: unsupportedAgent.id,
                conversationId: undefined,
                conversations: [],
                expectedAgent: unsupportedAgent,
            },
            {
                name: "unknown responding and selected agent",
                agentId: "unknown-agent",
                conversationId: undefined,
                conversations: [],
                selectedAgentId: "unknown-agent",
                expectedAgent: undefined,
            },
            {
                name: "no agent ID",
                agentId: undefined,
                conversationId: undefined,
                conversations: [],
                selectedAgentId: undefined,
                expectedAgent: undefined,
            },
            {
                name: "background conversation with its own agent",
                conversations: [selected, origin],
                expectedAgent: supportedAgent,
            },
            {
                name: "background conversation without an agent ID",
                conversations: [selected, { ...origin, agentId: undefined }],
                expectedAgent: supportedAgent,
            },
            {
                name: "unknown origin with a selected conversation",
                conversationId: "unknown-origin",
                expectedAgent: supportedAgent,
            },
            {
                name: "unknown origin without a selected conversation",
                conversationId: "unknown-origin",
                conversations: [],
                expectedAgent: supportedAgent,
            },
            {
                name: "origin identified by server ID",
                conversationId: origin.id,
                conversations: [selected, origin],
                expectedAgent: supportedAgent,
            },
            {
                name: "selection changed to an unsupported agent during the response",
                conversations: [{ ...origin, agentId: unsupportedAgent.id }],
                expectedAgent: supportedAgent,
            },
            {
                name: "selection changed to a supported agent during the response",
                agentId: unsupportedAgent.id,
                selectedAgentId: supportedAgent.id,
                expectedAgent: unsupportedAgent,
            },
            {
                name: "missing response agent despite a known selection",
                agentId: undefined,
                expectedAgent: undefined,
            },
        ])("includes only the responding agent for $name", async (testCase) => {
            const dispatch = vi.fn<(event: ChatEvent) => void>();
            const { conversationId, agentId } = {
                conversationId: origin.localId,
                agentId: supportedAgent.id,
                ...testCase,
            };
            const message = {
                ...clarificationMessage,
                agentId,
                content: {
                    type: "skillsActivated",
                    skills: [{ name: "dashboard_builder", title: "Build dashboard" }],
                },
            } as IChatConversationLocalItem;
            const options = {
                context: { eventDispatcher: { dispatch } },
                getState: (): TestState => ({
                    messages: [message],
                    threadId: "selected-thread",
                    conversations: [origin],
                    agents: [supportedAgent, unsupportedAgent],
                    selectedAgentId: unsupportedAgent.id,
                    ...testCase,
                    messagesByConversation: { [conversationId ?? ""]: [message] },
                }),
            };
            const payload = { assistantMessageId: message.localId, conversationId };

            if (kind === "streaming") {
                await runSaga(
                    options,
                    onEvaluateMessageStreaming,
                    evaluateMessageStreamingAction(payload),
                ).toPromise();
            } else {
                await runSaga(
                    options,
                    onEvaluateMessageComplete,
                    evaluateMessageCompleteAction(payload),
                ).toPromise();
            }

            expect(dispatch).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    type: "chatAssistantMessage",
                    agent: testCase.expectedAgent,
                }),
            );
        });
    });

    describe.each(["skills", "clarification", "completion", "cancellation"] as const)(
        "%s conversation identity",
        (kind) => {
            it.each(["origin-thread", undefined])(
                "does not substitute a local ID when metadata is missing (threadId: %s)",
                async (threadId) => {
                    const dispatch = vi.fn<(event: ChatEvent) => void>();
                    const message =
                        kind === "skills"
                            ? ({
                                  ...clarificationMessage,
                                  content: {
                                      type: "skillsActivated",
                                      skills: [{ name: "dashboard_builder", title: "Build dashboard" }],
                                  },
                              } as IChatConversationLocalItem)
                            : clarificationMessage;
                    const options = {
                        context: { eventDispatcher: { dispatch } },
                        getState: () => ({
                            messages: [],
                            threadId: "unrelated-thread",
                            conversations: [{ id: "unrelated-thread", localId: "other-conversation" }],
                            messagesByConversation: { "local-conversation": [message] },
                        }),
                    };
                    const payload = {
                        assistantMessageId: message.localId,
                        conversationId: "local-conversation",
                        threadId,
                    };

                    if (kind === "skills" || kind === "clarification") {
                        await runSaga(
                            options,
                            onEvaluateMessageStreaming,
                            evaluateMessageStreamingAction(payload),
                        ).toPromise();
                    } else {
                        await runSaga(
                            options,
                            onEvaluateMessageComplete,
                            evaluateMessageCompleteAction({ ...payload, cancelled: kind === "cancellation" }),
                        ).toPromise();
                    }

                    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
                        expect.objectContaining({
                            type:
                                kind === "clarification"
                                    ? "chatClarificationQuestions"
                                    : "chatAssistantMessage",
                            interactionId: message.id,
                            threadId,
                        }),
                    );
                },
            );
        },
    );

    it.each(["dashboard_builder", "dashboard_editor"] as const)(
        "reports %s activation while the skill item is still streaming",
        async (name) => {
            const dispatch = vi.fn<(event: ChatEvent) => void>();
            const message = {
                ...clarificationMessage,
                content: { type: "skillsActivated", skills: [{ name, title: name }] },
            } as IChatConversationLocalItem;

            await runSaga(
                {
                    context: { eventDispatcher: { dispatch } },
                    getState: () => ({
                        messages: [],
                        threadId: "unrelated-thread",
                        messagesByConversation: { "local-conversation": [message] },
                        conversations: [{ id: "origin-thread", localId: "local-conversation" }],
                    }),
                },
                onEvaluateMessageStreaming,
                evaluateMessageStreamingAction({
                    assistantMessageId: message.localId,
                    conversationId: "local-conversation",
                }),
            ).toPromise();

            expect(dispatch).toHaveBeenCalledExactlyOnceWith({
                type: "chatAssistantMessage",
                interactionId: message.id,
                threadId: "origin-thread",
                useCase: "GENERAL",
                skills: [{ name, title: name }],
            });
        },
    );

    it("does not report ordinary streamed text as a completed assistant message", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const message = {
            ...clarificationMessage,
            content: { type: "text", text: "Working" },
        } as IChatConversationLocalItem;

        await runSaga(
            {
                context: { eventDispatcher: { dispatch } },
                getState: () => ({ ...state, messagesByConversation: { "thread-id": [message] } }),
            },
            onEvaluateMessageStreaming,
            evaluateMessageStreamingAction({
                assistantMessageId: message.localId,
                conversationId: "thread-id",
            }),
        ).toPromise();

        expect(dispatch).not.toHaveBeenCalled();
    });

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

    it("reports structured prompt errors without marking successful response completion", async () => {
        const dispatch = vi.fn<(event: ChatEvent) => void>();
        const message = {
            id: "interaction-id",
            localId: "local-id",
            role: "assistant",
            content: {
                type: "error",
                code: 401,
                reason: "NOT_AUTHENTICATED",
                message: "Failed",
                traceId: "trace",
            },
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
            expect.objectContaining({
                type: "chatAssistantMessage",
                useCase: "INVALID",
                error: message.content,
            }),
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
                threadId: "thread-id",
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
