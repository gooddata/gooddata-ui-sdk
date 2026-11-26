// (C) 2026 GoodData Corporation

import { type UnknownAction, configureStore } from "@reduxjs/toolkit";
import { type Task, runSaga } from "redux-saga";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    type GenAIPublisherDocumentFormat,
    type IChatConversationContent,
    type IChatConversationError,
    type IChatConversationInteractionStep,
    type IChatConversationItem,
    type IChatConversationThreadQuery,
    NotAuthenticated,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { type IPublisherDocumentDefinitionV2, type IUserWorkspaceSettings } from "@gooddata/sdk-model";

import { type IChatConversationLocal, makeUserItem } from "../../model.js";
import { chatWindowSliceReducer, onDefinitionReceivedAction } from "../chatWindow/chatWindowSlice.js";
import { type EventDispatcher } from "../events.js";
import { conversationMessagesByIdSelector } from "../messages/messagesSelectors.js";
import {
    evaluateMessageCompleteAction,
    evaluateMessageErrorAction,
    evaluateMessageStreamingAction,
    loadConversationsSuccessAction,
    messagesSliceReducer,
    newMessageAction,
    setCurrentConversationAction,
    setMessagesAction,
    setSelectedAgentAction,
} from "../messages/messagesSlice.js";

import { onUserMessage } from "./onUserMessage.js";

function sentPublisherDocumentFormats(settings: IUserWorkspaceSettings | undefined) {
    const formats: GenAIPublisherDocumentFormat[] = [];
    const queryBuilder: IChatConversationThreadQuery = {
        withSearchLimit: () => queryBuilder,
        withCreateLimit: () => queryBuilder,
        withUserContext: () => queryBuilder,
        withObjectTypes: () => queryBuilder,
        withAllowedRelationshipTypes: () => queryBuilder,
        withIncludeTags: () => queryBuilder,
        withExcludeTags: () => queryBuilder,
        withEffort: () => queryBuilder,
        withPublisherDocumentFormat: (format) => {
            formats.push(format);
            return queryBuilder;
        },
        stream: () => new ReadableStream({ start: (controller) => controller.close() }),
    };
    const backend = {
        workspace: () => ({
            genAI: () => ({
                getChatConversations: () => ({
                    getConversationThread: () => ({ query: () => queryBuilder }),
                }),
            }),
        }),
    };
    const getState = () => ({
        messages: {
            ...messagesSliceReducer(undefined, { type: "test/init" }),
            currentConversation: {
                id: "conversation_1",
                localId: "local_conversation_1",
                title: "Conversation",
                createdAt: new Date(1).toISOString(),
                updatedAt: new Date(1).toISOString(),
            },
        },
        chatWindow: { ...chatWindowSliceReducer(undefined, { type: "test/init" }), settings },
    });

    return runSaga(
        {
            context: { backend, workspace: "workspace_1" },
            getState,
            dispatch: vi.fn<(action: UnknownAction) => void>(),
        },
        onUserMessage,
        newMessageAction(makeUserItem({ type: "text", text: "Draft a report" })),
    )
        .toPromise()
        .then(() => formats);
}

const settingsWithPublisherV2 = (enablePublisherV2: boolean): IUserWorkspaceSettings => ({
    userId: "user_1",
    workspace: "workspace_1",
    locale: "en-US",
    separators: { thousand: ",", decimal: "." },
    enablePublisherV2,
});

const conversation: IChatConversationLocal = {
    id: "server-conversation",
    localId: "local-conversation",
    title: "Conversation",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};

const publisherDocumentV2: IPublisherDocumentDefinitionV2 = {
    type: "document",
    version: "2",
    title: "Q2",
    period: { type: "absolute", granularity: "GDC.time.date", from: "2026-04-01", to: "2026-06-30" },
    content: { pages: [] },
};

type StreamChunk = IChatConversationItem | IChatConversationError | IChatConversationInteractionStep;

const tasks: Task[] = [];

afterEach(async () => {
    for (const task of tasks.splice(0)) {
        task.cancel();
        await task.toPromise();
    }
});

function item(
    content: IChatConversationContent,
    id = "reasoning-1",
    role: IChatConversationItem["role"] = "assistant",
): IChatConversationItem {
    return { type: "item", id, responseId: "response-1", createdAt: 1, role, content };
}

function reasoning(summary: string, id = "reasoning-1", role: IChatConversationItem["role"] = "assistant") {
    return item({ type: "reasoning", summary }, id, role);
}

function setup(text = "How are sales?", current = conversation) {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
    });
    store.dispatch(setCurrentConversationAction({ conversation: current }));
    const action = newMessageAction(makeUserItem({ type: "text", text }));
    store.dispatch(action);

    let controller!: ReadableStreamDefaultController<StreamChunk>;
    const cancelStream = vi.fn<() => void>();
    const stream = new ReadableStream<StreamChunk>({
        start(value) {
            controller = value;
        },
        cancel: cancelStream,
    });
    const query: IChatConversationThreadQuery = {
        withSearchLimit: () => query,
        withCreateLimit: () => query,
        withUserContext: () => query,
        withObjectTypes: () => query,
        withAllowedRelationshipTypes: () => query,
        withIncludeTags: () => query,
        withExcludeTags: () => query,
        withEffort: () => query,
        withPublisherDocumentFormat: () => query,
        stream: () => stream,
    };
    const queryContent = vi.fn<(content: IChatConversationContent) => IChatConversationThreadQuery>(
        () => query,
    );
    const backend = {
        workspace: () => ({
            genAI: () => ({
                getChatConversations: () => ({
                    getConversationThread: () => ({ query: queryContent }),
                }),
            }),
        }),
    };
    const dispatchEvent = vi.fn<EventDispatcher["dispatch"]>();
    const actions: UnknownAction[] = [];
    const task = runSaga(
        {
            context: { backend, workspace: "workspace-1", eventDispatcher: { dispatch: dispatchEvent } },
            getState: store.getState,
            dispatch(action: UnknownAction) {
                actions.push(action);
                return store.dispatch(action);
            },
        },
        onUserMessage,
        action,
    );
    tasks.push(task);

    return {
        store,
        task,
        actions,
        queryContent,
        cancelStream,
        events: () => dispatchEvent.mock.calls.map(([event]) => event),
        async send(chunk: StreamChunk) {
            controller.enqueue(chunk);
            await new Promise((resolve) => setTimeout(resolve, 0));
        },
        async finish() {
            controller.close();
            await task.toPromise();
        },
        async fail(error: unknown) {
            controller.error(error);
            await task.toPromise();
        },
    };
}

const clearEvent = {
    type: "chatReasoning",
    threadId: conversation.id,
    title: undefined,
};

function titleEvent(title: string, interactionId = "reasoning-1") {
    return { type: "chatReasoning", threadId: conversation.id, interactionId, title };
}

describe("onUserMessage failed responses", () => {
    function expectFinished(run: ReturnType<typeof setup>) {
        const state = run.store.getState();
        expect(state.messages.conversationsData[conversation.localId].asyncProcess).toBeUndefined();
        expect(state.messages.currentConversation?.inProgress).toBe(false);
        const messages = conversationMessagesByIdSelector(state, conversation.localId);
        expect(
            messages
                .filter((message) => message.role === "assistant")
                .every((message) => message.complete && !message.streaming),
        ).toBe(true);
        expect(run.events().at(-1)).toEqual(clearEvent);
        return messages;
    }

    it("finishes typed session failures with an observable authentication error", async () => {
        const run = setup();
        await run.send(reasoning("# Thinking"));
        await run.fail(new NotAuthenticated("No session or session expired"));

        expect(expectFinished(run).at(-1)?.content).toMatchObject({
            type: "error",
            code: 401,
            reason: "NOT_AUTHENTICATED",
        });
    });

    it.each([401, 403, 404, 503])(
        "terminates a streamed %s error without waiting for the stream to close",
        async (code) => {
            const run = setup();
            await run.send(reasoning("# Thinking", "reasoning-1"));
            await run.send(item({ type: "text", text: "Partial answer" }, "answer-1"));
            await run.send({ type: "error", code, message: "Request failed", traceId: "trace-1" });

            expect(run.task.isRunning()).toBe(false);
            await run.task.toPromise();
            const messages = expectFinished(run);
            expect(messages).toHaveLength(4);
            expect(messages.at(-2)).toMatchObject({
                id: "answer-1",
                content: { type: "text", text: "Partial answer" },
            });
            expect(messages.at(-1)).toMatchObject({
                id: "",
                content: {
                    type: "error",
                    code,
                    message: "Request failed",
                    traceId: "trace-1",
                    ...(code === 401 ? { reason: "NOT_AUTHENTICATED" } : {}),
                },
            });
            expect(run.cancelStream).toHaveBeenCalledOnce();
        },
    );

    it("preserves a partial answer when the stream throws", async () => {
        const run = setup();
        await run.send(item({ type: "text", text: "Partial answer" }, "answer-1"));
        await run.fail(new NotAuthenticated("No session or session expired"));

        const messages = expectFinished(run);
        expect(messages).toHaveLength(3);
        expect(messages.at(-2)).toMatchObject({
            id: "answer-1",
            content: { type: "text", text: "Partial answer" },
        });
        expect(messages.at(-1)?.content).toMatchObject({
            type: "error",
            code: 401,
            reason: "NOT_AUTHENTICATED",
        });
    });

    describe.each([false, true])("falsy stream rejections (partial answer: %s)", (hasPartialAnswer) => {
        it.each([0, false, "", null, undefined, NaN])("reports rejection %s as a failure", async (error) => {
            const run = setup();
            if (hasPartialAnswer) {
                await run.send(item({ type: "text", text: "Partial answer" }, "answer-1"));
            }
            await run.fail(error);

            const messages = expectFinished(run);
            expect(messages.slice(1).map((message) => message.content)).toMatchObject([
                ...(hasPartialAnswer ? [{ type: "text", text: "Partial answer" }] : []),
                { type: "error", message: String(error) },
            ]);
            expect(run.actions.filter(evaluateMessageErrorAction.match)).toHaveLength(1);
            expect(
                run.actions.filter(evaluateMessageCompleteAction.match).at(-1)?.payload,
            ).not.toHaveProperty("responseCompleted");
        });
    });

    it.each(["answer-1", "answer-2"])(
        "continues with item %s after a conversion error without losing earlier content",
        async (nextItemId) => {
            const run = setup();
            await run.send(item({ type: "text", text: "Partial answer" }, "answer-1"));
            const error: IChatConversationError = { type: "error", code: 0, message: "Invalid YAML" };
            await run.send(error);

            expect(run.task.isRunning()).toBe(true);
            expect(run.cancelStream).not.toHaveBeenCalled();
            expect(run.store.getState().messages.currentConversation?.inProgress).toBe(true);
            expect(run.store.getState().messages.conversationsData[conversation.localId].asyncProcess).toBe(
                "evaluating",
            );

            await run.send(item({ type: "text", text: "Remaining answer" }, nextItemId));
            await run.finish();

            expect(
                expectFinished(run)
                    .slice(1)
                    .map((message) => message.content),
            ).toEqual([
                { type: "text", text: "Partial answer" },
                error,
                { type: "text", text: "Remaining answer" },
            ]);
            expect(run.actions.filter(evaluateMessageErrorAction.match)).toHaveLength(0);
            expect(run.cancelStream).not.toHaveBeenCalled();
        },
    );

    it("keeps consecutive conversion errors visible when the stream closes", async () => {
        const run = setup();
        const errors: IChatConversationError[] = [
            { type: "error", code: 0, message: "Invalid visualization YAML" },
            { type: "error", code: 0, message: "Invalid document YAML" },
        ];
        for (const error of errors) {
            await run.send(error);
            expect(run.task.isRunning()).toBe(true);
        }
        await run.finish();

        expect(
            expectFinished(run)
                .slice(1)
                .map((message) => message.content),
        ).toEqual(errors);
        expect(run.actions.filter(evaluateMessageErrorAction.match)).toHaveLength(0);
        expect(run.cancelStream).not.toHaveBeenCalled();
    });

    it("terminates a backend error after a recoverable conversion error", async () => {
        const run = setup();
        const conversionError: IChatConversationError = { type: "error", code: 0, message: "Invalid YAML" };
        await run.send(conversionError);
        await run.send({ type: "error", code: 401, message: "Unauthorized" });

        expect(run.task.isRunning()).toBe(false);
        await run.task.toPromise();
        const messages = expectFinished(run);
        expect(messages.at(-2)?.content).toEqual(conversionError);
        expect(messages.at(-1)?.content).toMatchObject({
            type: "error",
            code: 401,
            reason: "NOT_AUTHENTICATED",
        });
        expect(run.cancelStream).toHaveBeenCalledOnce();
    });

    it.each(["pending", "rejected"])(
        "does not let %s reader cancellation strand an error",
        async (cleanup) => {
            const run = setup();
            run.cancelStream.mockImplementationOnce(() =>
                cleanup === "pending"
                    ? new Promise<void>(() => undefined)
                    : Promise.reject(new Error("Cleanup failed")),
            );
            await run.send({ type: "error", code: 401, message: "Unauthorized" });

            expect(run.task.isRunning()).toBe(false);
            await run.task.toPromise();
            expect(expectFinished(run).at(-1)?.content).toMatchObject({
                type: "error",
                code: 401,
                reason: "NOT_AUTHENTICATED",
            });
        },
    );

    it("keeps structured HTTP errors on the last assistant message", async () => {
        const run = setup();
        await run.send(reasoning("# Thinking"));
        await run.fail(
            new UnexpectedResponseError("Request failed", 404, {
                detail: "Result not found in result cache.",
                traceId: "trace-cache",
            }),
        );

        expect(expectFinished(run).at(-1)?.content).toMatchObject({
            type: "error",
            code: 404,
            traceId: "trace-cache",
        });
    });

    it.each([
        { name: "empty stream", chunks: [] },
        { name: "user echo only", chunks: [item({ type: "text", text: "Question" }, "user-1", "user")] },
        { name: "empty reasoning", chunks: [reasoning("")] },
        { name: "whitespace answer", chunks: [item({ type: "text", text: "  \n" })] },
        {
            name: "tool only",
            chunks: [
                item({ type: "toolCall", id: "call-1", callId: "call-1", name: "search", arguments: {} }),
            ],
        },
    ])("surfaces an actionable error for $name", async ({ chunks }) => {
        const run = setup();
        for (const chunk of chunks) {
            await run.send(chunk);
        }
        await run.finish();

        expect(expectFinished(run).at(-1)?.content).toMatchObject({
            type: "error",
            reason: "EMPTY_RESPONSE",
        });
    });

    it("does not replace a successful answer when the stream closes", async () => {
        const run = setup();
        await run.send(item({ type: "text", text: "Sales are growing." }));
        await run.finish();

        expect(expectFinished(run).at(-1)?.content).toEqual({ type: "text", text: "Sales are growing." });
    });
});

describe("onUserMessage raw content", () => {
    it.each([
        "What about the U.S. state?",
        "(top 3) **bold** ~~struck~~ :rocket: C:\\data\\a_b.csv",
        "quote:\n> quoted line\n# heading\n1. item\n- bullet",
    ])("passes user text to the backend without Markdown escaping: %s", async (text) => {
        const test = setup(text);
        await test.finish();

        expect(test.queryContent).toHaveBeenCalledExactlyOnceWith({ type: "text", text });
    });
});

describe("onUserMessage with different publisher settings", () => {
    it.each<[string, IUserWorkspaceSettings | undefined, GenAIPublisherDocumentFormat]>([
        ["aac-v2 with Publisher v2 on", settingsWithPublisherV2(true), "aac-v2"],
        ["aac-v1 with Publisher v2 off", settingsWithPublisherV2(false), "aac-v1"],
        ["aac-v1 without settings", undefined, "aac-v1"],
    ])("asks for %s", async (_name, settings, expected) => {
        expect(await sentPublisherDocumentFormats(settings)).toEqual([expected]);
    });
});

describe("onUserMessage answering agent", () => {
    it("captures the agent before selection changes, including later interactions without an agent ID", async () => {
        const run = setup("Create a dashboard", { ...conversation, agentId: "agent-a" });
        const messages = () =>
            conversationMessagesByIdSelector(run.store.getState(), conversation.localId).filter(
                (message) => message.role === "assistant",
            );
        expect(messages().map((message) => message.agentId)).toEqual(["agent-a"]);

        run.store.dispatch(setSelectedAgentAction({ agentId: "agent-b", showChangeEvent: true }));
        await run.send(
            item({
                type: "skillsActivated",
                skills: [{ name: "dashboard_builder", title: "Build dashboard" }],
            }),
        );
        await run.send(item({ type: "text", text: "Answer" }, "answer-1"));
        await run.finish();

        expect(run.store.getState().messages.currentConversation?.agentId).toBe("agent-b");
        expect(messages()).toHaveLength(2);
        expect(messages().map((message) => message.agentId)).toEqual(["agent-a", "agent-a"]);
    });

    it("keeps per-item agents on live user and assistant messages across streamed interactions", async () => {
        const run = setup();
        await run.send({
            ...item({ type: "text", text: "How are sales?" }, "user-1", "user"),
            agentId: "agent-a",
        });
        await run.send({ ...reasoning("# Plan"), agentId: "agent-a" });
        await run.send({ ...reasoning("# Updated plan"), agentId: "agent-a" });
        await run.send({ ...item({ type: "text", text: "Answer" }, "answer-1"), agentId: "agent-a" });
        await run.finish();

        run.store.dispatch(
            setCurrentConversationAction({ conversation: { ...conversation, agentId: "agent-b" } }),
        );
        const messages = conversationMessagesByIdSelector(run.store.getState(), conversation.localId);
        expect(messages).toHaveLength(3);
        expect(messages.map((message) => message.agentId)).toEqual(["agent-a", "agent-a", "agent-a"]);
    });

    it("does not erase a streamed agent id when a later chunk omits it", async () => {
        const run = setup();
        await run.send({ ...reasoning("# Plan"), agentId: "agent-a" });
        await run.send(reasoning("# Updated plan"));
        await run.finish();

        expect(
            conversationMessagesByIdSelector(run.store.getState(), conversation.localId).at(-1)?.agentId,
        ).toBe("agent-a");
    });

    it("preserves a streamed agent on later interactions without an agent ID", async () => {
        const run = setup("Create a dashboard", { ...conversation, agentId: "initial-agent" });
        await run.send({ ...reasoning("# Plan"), agentId: "agent-a" });
        run.store.dispatch(setSelectedAgentAction({ agentId: "agent-b", showChangeEvent: true }));
        await run.send(item({ type: "text", text: "Answer" }, "answer-1"));
        await run.finish();

        const messages = conversationMessagesByIdSelector(run.store.getState(), conversation.localId).filter(
            (message) => message.role === "assistant",
        );
        expect(messages).toHaveLength(2);
        expect(messages.map((message) => message.agentId)).toEqual(["agent-a", "agent-a"]);
    });

    it("names the turn's agent on a drafted document whose chunk omits it", async () => {
        // given
        const run = setup();
        await run.send({ ...reasoning("# Plan"), agentId: "agent-a" });

        // when
        await run.send(
            item(
                {
                    type: "multipart",
                    parts: [{ type: "publisherDocumentV2", publisherDocument: publisherDocumentV2 }],
                },
                "document-1",
            ),
        );
        await run.finish();

        // then
        const definitions = run.actions.filter(onDefinitionReceivedAction.match);
        expect(definitions).toHaveLength(1);
        expect(definitions[0].payload).toMatchObject({
            definitionType: "publisherDocumentV2",
            agentId: "agent-a",
        });
    });
});

describe("onUserMessage conversation identity", () => {
    it.each(["completed", "error chunk", "failed", "cancelled"] as const)(
        "preserves the originating IDs after metadata refresh when the response is %s",
        async (outcome) => {
            const run = setup();
            const otherConversation = { ...conversation, id: "other-thread", localId: "other-local" };
            run.store.dispatch(setCurrentConversationAction({ conversation: otherConversation }));
            run.store.dispatch(loadConversationsSuccessAction({ conversations: [otherConversation] }));
            expect(run.store.getState().messages.conversations).toEqual([otherConversation]);
            expect(run.store.getState().messages.conversationsData[conversation.localId]).toBeDefined();

            await run.send(
                item({
                    type: "skillsActivated",
                    skills: [{ name: "dashboard_builder", title: "Build dashboard" }],
                }),
            );
            await run.send(item({ type: "text", text: "Working" }, "interaction-2"));
            if (outcome === "cancelled") {
                run.task.cancel();
                await run.task.toPromise();
            } else if (outcome === "failed") {
                await run.fail(new Error("Stream failed"));
            } else {
                if (outcome === "error chunk") {
                    await run.send({ type: "error", code: 500, message: "Failed" });
                    await run.task.toPromise();
                } else {
                    await run.finish();
                }
            }

            const streaming = run.actions.filter(evaluateMessageStreamingAction.match);
            const completions = run.actions.filter(evaluateMessageCompleteAction.match);
            expect(streaming.length).toBeGreaterThanOrEqual(2);
            expect(completions.length).toBeGreaterThanOrEqual(2);
            for (const { payload } of [...streaming, ...completions]) {
                expect(payload).toEqual(
                    expect.objectContaining({
                        conversationId: conversation.localId,
                        threadId: conversation.id,
                    }),
                );
            }
        },
    );
});

describe("onUserMessage cancellation with replacement messages", () => {
    it.each(["item", "conversion error", "content after conversion error"] as const)(
        "completes the active message once when cancelled after %s",
        async (kind) => {
            const run = setup();
            await run.send(item({ type: "text", text: "Partial answer" }, "answer-1"));
            if (kind === "item") {
                await run.send(item({ type: "text", text: "More content" }, "answer-2"));
            } else {
                await run.send({ type: "error", code: 0, message: "Invalid YAML" });
                if (kind === "content after conversion error") {
                    await run.send(item({ type: "text", text: "More content" }, "answer-2"));
                }
            }
            const messagesBeforeCancellation = conversationMessagesByIdSelector(
                run.store.getState(),
                conversation.localId,
            ).slice(1);

            run.task.cancel();
            await run.task.toPromise();

            const completions = run.actions.filter(evaluateMessageCompleteAction.match);
            expect(completions.map(({ payload }) => payload.assistantMessageId)).toEqual(
                messagesBeforeCancellation.map((message) => message.localId),
            );
            expect(completions.at(-1)?.payload).toMatchObject({
                assistantMessageId: messagesBeforeCancellation.at(-1)?.localId,
                cancelled: true,
            });
            expect(completions.at(-1)?.payload.responseCompleted).toBeUndefined();
            const messages = conversationMessagesByIdSelector(run.store.getState(), conversation.localId);
            expect(messages.slice(1).every((message) => message.complete && !message.streaming)).toBe(true);
            expect(messages.at(-1)?.cancelled).toBe(true);
            expect(messages.slice(1).map((message) => message.content)).toEqual(
                messagesBeforeCancellation.map((message) => message.content),
            );
            expect(run.cancelStream).toHaveBeenCalledOnce();
        },
    );

    it.each(["item", "conversion error", "backend error"] as const)(
        "tracks the replacement if cancelled while creating it for %s",
        async (kind) => {
            const run = setup();
            await run.send(item({ type: "text", text: "Partial answer" }, "answer-1"));
            const unsubscribe = run.store.subscribe(() => {
                const messages = conversationMessagesByIdSelector(run.store.getState(), conversation.localId);
                if (messages.length === 3 && run.task.isRunning()) {
                    run.task.cancel();
                }
            });

            await run.send(
                kind === "item"
                    ? item({ type: "text", text: "More content" }, "answer-2")
                    : { type: "error", code: kind === "conversion error" ? 0 : 500, message: "Failed" },
            );
            await run.task.toPromise();
            unsubscribe();

            const [, first, replacement] = conversationMessagesByIdSelector(
                run.store.getState(),
                conversation.localId,
            );
            expect(first).toMatchObject({
                complete: true,
                content: { type: "text", text: "Partial answer" },
            });
            expect(replacement).toMatchObject({ complete: true, streaming: false, cancelled: true });
            const completions = run.actions.filter(evaluateMessageCompleteAction.match);
            expect(completions.map(({ payload }) => payload.assistantMessageId)).toEqual([
                first.localId,
                replacement.localId,
            ]);
            expect(completions.at(-1)?.payload.cancelled).toBe(true);
            expect(completions.at(-1)?.payload.responseCompleted).toBeUndefined();
            expect(run.cancelStream).toHaveBeenCalledOnce();
        },
    );
});

describe("onUserMessage reasoning titles", () => {
    it("clears at response start and emits live titles from accumulated snapshots, without the body", async () => {
        const run = setup();

        expect(run.events()).toStrictEqual([clearEvent]);

        await run.send(reasoning("# Pl"));
        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Pl")]);

        await run.send(reasoning("# **Plan**\nPrivate reasoning body"));

        expect(run.task.isRunning()).toBe(true);
        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Pl"), titleEvent("Plan")]);
        expect(
            conversationMessagesByIdSelector(run.store.getState(), conversation.localId).at(-1)?.content,
        ).toEqual({ type: "reasoning", summary: "# **Plan**\nPrivate reasoning body" });
        expect(JSON.stringify(run.events())).not.toContain("Private reasoning body");

        await run.finish();
        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Pl"), titleEvent("Plan"), clearEvent]);
    });

    it("suppresses unchanged headings and keeps the latest title through intermediate content", async () => {
        const run = setup();
        await run.send(reasoning("# Plan\nFirst body"));
        await run.send(reasoning("# Plan\nA longer body"));
        await run.send(item({ type: "text", text: "Working on it" }, "intermediate"));
        await run.send(
            item(
                { type: "toolCall", id: "call-1", callId: "call-1", name: "search", arguments: {} },
                "tool-call",
            ),
        );
        await run.send(
            item({ type: "toolResult", callId: "call-1", result: "result" }, "tool-result", "tool"),
        );
        await run.send({
            type: "interaction_step",
            conversationId: conversation.id,
            responseId: "response-1",
            stepId: "step-1",
            stepIndex: 0,
            durationMs: 1,
            tokens: {},
            createdAt: 1,
        });

        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Plan")]);

        await run.send(reasoning("# Plan\nSame title in another step", "reasoning-2"));
        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Plan")]);

        await run.send(reasoning("\n**Check results**\nAnother private body", "reasoning-3"));
        expect(run.events()).toStrictEqual([
            clearEvent,
            titleEvent("Plan"),
            titleEvent("Check results", "reasoning-3"),
        ]);
        await run.finish();
        expect(run.events().at(-1)).toStrictEqual(clearEvent);
    });

    it("ignores empty, user and system reasoning without clearing the current title", async () => {
        const run = setup();
        await run.send(reasoning("\n  \n"));
        expect(run.events()).toStrictEqual([clearEvent]);

        await run.send(reasoning("# Plan"));
        await run.send(reasoning("# User reasoning", "user-1", "user"));
        await run.send(reasoning("# System reasoning", "system-1", "system"));
        await run.send(reasoning("", "reasoning-2"));

        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Plan")]);
        await run.finish();
        expect(run.events().at(-1)).toStrictEqual(clearEvent);
    });

    it("clears on normal completion even when no reasoning arrives", async () => {
        const run = setup();
        await run.send(item({ type: "text", text: "Answer" }));
        await run.finish();

        expect(run.events()).toStrictEqual([clearEvent, clearEvent]);
    });

    it("clears when reading the stream throws", async () => {
        const run = setup();
        await run.send(reasoning("# Plan\nPrivate body"));
        await run.fail(new Error("Stream failed"));

        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Plan"), clearEvent]);
        expect(
            run.actions.filter(evaluateMessageCompleteAction.match).at(-1)?.payload.responseCompleted,
        ).toBe(undefined);
    });

    it("keeps streamed reasoning before a separate stream failure", async () => {
        const run = setup();
        await run.send(reasoning("# Plan"));
        await run.send(reasoning("# Collecting data", "reasoning-2"));
        await run.fail(new Error("Stream failed"));

        const messages = conversationMessagesByIdSelector(run.store.getState(), conversation.localId);
        expect(messages).toHaveLength(4);
        const [, first, second, last] = messages;
        expect(first.content).toEqual({ type: "reasoning", summary: "# Plan" });
        expect(second.content).toEqual({ type: "reasoning", summary: "# Collecting data" });
        expect(last.content.type).toBe("error");
        expect(last.streaming).toBe(false);
    });

    it("clears after an error chunk ends the stream", async () => {
        const run = setup();
        await run.send(reasoning("# Plan"));
        await run.send({ type: "error", code: 500, message: "Failed" });
        await run.task.toPromise();

        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Plan"), clearEvent]);
    });

    it("marks only the final successful assistant message as response-complete", async () => {
        const run = setup();
        await run.send(item({ type: "text", text: "Working" }, "interaction-1"));
        await run.send(item({ type: "text", text: "Please approve" }, "interaction-2"));
        await run.finish();

        const completions = run.actions.filter(evaluateMessageCompleteAction.match);
        expect(completions.map(({ payload }) => payload.responseCompleted)).toEqual([undefined, true]);
    });

    it("does not mistake an error message for a new interaction ID", async () => {
        const run = setup();
        await run.send(item({ type: "text", text: "Working" }, "interaction-1"));
        await run.send({ type: "error", code: 500, message: "error-interaction" });
        await run.task.toPromise();

        const [first] = run.actions.filter(evaluateMessageStreamingAction.match);
        const [failure] = run.actions.filter(evaluateMessageErrorAction.match);
        const completions = run.actions.filter(evaluateMessageCompleteAction.match);
        expect(completions.map(({ payload }) => payload)).toStrictEqual([
            {
                assistantMessageId: first.payload.assistantMessageId,
                conversationId: conversation.localId,
                threadId: conversation.id,
            },
            {
                assistantMessageId: failure.payload.assistantMessageId,
                conversationId: conversation.localId,
                threadId: conversation.id,
                cancelled: false,
            },
        ]);
        expect(failure.payload.assistantMessageId).not.toBe(first.payload.assistantMessageId);
        expect(failure.payload.error.message).toBe("error-interaction");
        expect(run.actions.indexOf(failure)).toBeLessThan(run.actions.indexOf(completions[1]));
        const messages = conversationMessagesByIdSelector(run.store.getState(), conversation.localId);
        expect(messages.at(-2)?.id).toBe("interaction-1");
        expect(messages.at(-1)?.id).toBe("");
    });

    it.each(["item", "error", "conversion error"] as const)(
        "does not complete a removed message when a new %s interaction arrives",
        async (kind) => {
            const run = setup();
            await run.send(item({ type: "text", text: "Working" }, "interaction-1"));
            run.store.dispatch(setMessagesAction({ items: [] }));
            await run.send(
                kind === "item"
                    ? item({ type: "text", text: "Answer" }, "interaction-2")
                    : { type: "error", code: kind === "error" ? 500 : 0, message: "error-interaction" },
            );
            await (kind === "item" ? run.finish() : run.task.toPromise());

            const [first, last] = run.actions.filter(evaluateMessageStreamingAction.match);
            const completions = run.actions.filter(evaluateMessageCompleteAction.match);
            expect(completions.map(({ payload }) => payload)).toStrictEqual(
                kind === "item"
                    ? [
                          {
                              assistantMessageId: last.payload.assistantMessageId,
                              conversationId: conversation.localId,
                              threadId: conversation.id,
                              cancelled: false,
                              responseCompleted: true,
                          },
                      ]
                    : [],
            );
            expect(completions.map(({ payload }) => payload.assistantMessageId)).not.toContain(
                first.payload.assistantMessageId,
            );
            expect(
                conversationMessagesByIdSelector(run.store.getState(), conversation.localId).map(
                    (message) => message.content,
                ),
            ).toEqual(kind === "item" ? [{ type: "text", text: "Answer" }] : []);
        },
    );

    it("clears on cancellation and cancels the pending reader", async () => {
        const run = setup();
        await run.send(reasoning("# Plan"));
        run.task.cancel();
        await run.task.toPromise();
        await vi.waitFor(() => expect(run.cancelStream).toHaveBeenCalledOnce());

        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Plan"), clearEvent]);
        const completion = run.actions.filter(evaluateMessageCompleteAction.match).at(-1);
        expect(completion?.payload.cancelled).toBe(true);
        expect(completion?.payload.responseCompleted).toBeUndefined();
    });

    it("uses the original server thread ID after navigating away and removing the assistant message", async () => {
        const run = setup();
        await run.send(reasoning("# Plan"));
        run.store.dispatch(setMessagesAction({ items: [] }));
        run.store.dispatch(
            setCurrentConversationAction({
                conversation: { ...conversation, id: "other-server-id", localId: "other-local-id" },
            }),
        );

        run.task.cancel();
        await run.task.toPromise();
        await vi.waitFor(() => expect(run.cancelStream).toHaveBeenCalledOnce());

        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Plan"), clearEvent]);
        expect(run.events().every((event) => event.threadId === conversation.id)).toBe(true);
        expect(run.actions.filter(evaluateMessageStreamingAction.match)).toHaveLength(1);
        expect(run.actions.filter(evaluateMessageCompleteAction.match)).toEqual([]);
    });
});
