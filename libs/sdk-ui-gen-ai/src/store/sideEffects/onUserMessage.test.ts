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
} from "@gooddata/sdk-backend-spi";
import { type IUserWorkspaceSettings } from "@gooddata/sdk-model";

import { type IChatConversationLocal, makeUserItem } from "../../model.js";
import { chatWindowSliceReducer } from "../chatWindow/chatWindowSlice.js";
import { type EventDispatcher } from "../events.js";
import { conversationMessagesByIdSelector } from "../messages/messagesSelectors.js";
import {
    evaluateMessageCompleteAction,
    evaluateMessageStreamingAction,
    messagesSliceReducer,
    newMessageAction,
    setCurrentConversationAction,
    setMessagesAction,
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

function setup() {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
    });
    store.dispatch(setCurrentConversationAction({ conversation }));
    const action = newMessageAction(makeUserItem({ type: "text", text: "How are sales?" }));
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
    const backend = {
        workspace: () => ({
            genAI: () => ({
                getChatConversations: () => ({
                    getConversationThread: () => ({ query: () => query }),
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
        async fail() {
            controller.error(new Error("Stream failed"));
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

describe("onUserMessage with different publisher settings", () => {
    it.each<[string, IUserWorkspaceSettings | undefined, GenAIPublisherDocumentFormat]>([
        ["aac-v2 with Publisher v2 on", settingsWithPublisherV2(true), "aac-v2"],
        ["aac-v1 with Publisher v2 off", settingsWithPublisherV2(false), "aac-v1"],
        ["aac-v1 without settings", undefined, "aac-v1"],
    ])("asks for %s", async (_name, settings, expected) => {
        expect(await sentPublisherDocumentFormats(settings)).toEqual([expected]);
    });
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
        await run.fail();

        expect(run.events()).toStrictEqual([clearEvent, titleEvent("Plan"), clearEvent]);
        expect(
            run.actions.filter(evaluateMessageCompleteAction.match).at(-1)?.payload.responseCompleted,
        ).toBe(undefined);
    });

    it("clears after an error chunk ends the stream", async () => {
        const run = setup();
        await run.send(reasoning("# Plan"));
        await run.send({ type: "error", code: 500, message: "Failed" });
        await run.finish();

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
    });
});
