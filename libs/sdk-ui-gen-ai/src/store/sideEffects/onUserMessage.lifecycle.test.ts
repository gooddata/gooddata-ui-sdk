// (C) 2026 GoodData Corporation

import { type UnknownAction, configureStore } from "@reduxjs/toolkit";
import { type Task, runSaga } from "redux-saga";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    type IChatConversation,
    type IChatConversationItem,
    type IChatConversationThreadQuery,
} from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal, makeUserItem } from "../../model.js";
import { chatWindowSliceReducer } from "../chatWindow/chatWindowSlice.js";
import { type EventDispatcher } from "../events.js";
import { conversationMessagesByIdSelector } from "../messages/messagesSelectors.js";
import {
    activateConversationAction,
    applyPendingAgentSwitchAction,
    evaluateMessageAction,
    evaluateMessageCompleteAction,
    evaluateMessageErrorAction,
    messagesSliceReducer,
    newMessageAction,
    pinConversationSuccessAction,
    renameConversationSuccessAction,
    revertAgentSwitchAction,
    setCurrentConversationAction,
    setSelectedAgentAction,
    startNewConversationAction,
    upsertConversationAction,
} from "../messages/messagesSlice.js";

import { onUserMessage } from "./onUserMessage.js";

const conversation: IChatConversationLocal = {
    id: "server-conversation",
    localId: "runtime-conversation",
    title: "Existing conversation",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    agentId: "previous-agent",
};
const draft = { ...conversation, id: "", agentId: undefined };
const created: IChatConversation = { ...conversation, id: "created-conversation", agentId: undefined };
const tasks: Task[] = [];

afterEach(async () => {
    for (const task of tasks.splice(0)) {
        task.cancel();
        await task.toPromise();
    }
    vi.restoreAllMocks();
});

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => {
        resolve = done;
    });
    return { promise, resolve };
}

function setup({
    current = conversation,
    selectedAgentId,
    pendingAgentId,
    isPreview = false,
    content = { type: "text", text: "How are sales?" },
}: {
    current?: IChatConversationLocal;
    selectedAgentId?: string;
    pendingAgentId?: string;
    isPreview?: boolean;
    content?: Parameters<typeof makeUserItem>[0];
} = {}) {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
        preloadedState: {
            messages: { ...messagesSliceReducer(undefined, { type: "init" }), selectedAgentId },
            chatWindow: { ...chatWindowSliceReducer(undefined, { type: "init" }), isPreview },
        },
    });
    store.dispatch(setCurrentConversationAction({ conversation: current }));
    if (pendingAgentId) {
        store.dispatch(setSelectedAgentAction({ agentId: pendingAgentId, showChangeEvent: true }));
    }
    const action = newMessageAction(makeUserItem(content));
    store.dispatch(action);

    const trace: string[] = [];
    const stream = vi.fn(() => {
        trace.push("stream");
        return new ReadableStream({ start: (controller) => controller.close() });
    });
    const queryBuilder: IChatConversationThreadQuery = {
        withSearchLimit: () => queryBuilder,
        withCreateLimit: () => queryBuilder,
        withUserContext: () => queryBuilder,
        withObjectTypes: () => queryBuilder,
        withAllowedRelationshipTypes: () => queryBuilder,
        withIncludeTags: () => queryBuilder,
        withExcludeTags: () => queryBuilder,
        withEffort: () => queryBuilder,
        withPublisherDocumentFormat: () => queryBuilder,
        stream,
    };
    const query = vi.fn(() => {
        trace.push("query");
        return queryBuilder;
    });
    const api = {
        create: vi.fn(async (_options?: { agentId?: string }): Promise<IChatConversation> => {
            trace.push("create");
            return created;
        }),
        update: vi.fn(async (_id: string, _changes: { title?: string }): Promise<IChatConversation> => {
            trace.push("update");
            return { ...created, title: "Server title" };
        }),
        switchAgent: vi.fn(async (_id: string, agentId: string): Promise<IChatConversation> => {
            trace.push("switch");
            return { ...conversation, agentId };
        }),
        getConversationThread: vi.fn(() => ({ query })),
    };
    const getChatConversations = vi.fn(() => api);
    const workspace = vi.fn(() => ({ genAI: () => ({ getChatConversations }) }));
    const dispatchEvent = vi.fn<EventDispatcher["dispatch"]>(() => {
        trace.push("reasoning");
    });
    const actions: UnknownAction[] = [];

    return {
        store,
        api,
        query,
        stream,
        workspace,
        getChatConversations,
        dispatchEvent,
        actions,
        trace,
        action,
        start(messageAction = action) {
            const task = runSaga(
                {
                    context: {
                        backend: { workspace },
                        workspace: "workspace-1",
                        isPreview,
                        eventDispatcher: { dispatch: dispatchEvent },
                    },
                    getState: store.getState,
                    dispatch(action: UnknownAction) {
                        trace.push(action.type);
                        actions.push(action);
                        return store.dispatch(action);
                    },
                },
                onUserMessage,
                messageAction,
            );
            tasks.push(task);
            return task;
        },
        messages: () => conversationMessagesByIdSelector(store.getState(), current.localId),
    };
}

describe("onUserMessage conversation preparation", () => {
    it.each([
        { stage: "create", navigation: "existing" },
        { stage: "create", navigation: "new" },
        { stage: "update", navigation: "existing" },
        { stage: "update", navigation: "new" },
    ] as const)(
        "keeps the $navigation conversation selected when $stage finishes in the background",
        async ({ stage, navigation }) => {
            const run = setup({ current: draft, selectedAgentId: "original-agent" });
            const pending = deferred<IChatConversation>();
            run.api[stage].mockReturnValueOnce(pending.promise);
            run.stream.mockReturnValueOnce(
                new ReadableStream<IChatConversationItem>({
                    start(controller) {
                        controller.enqueue({
                            type: "item",
                            id: "answer",
                            responseId: "response-1",
                            role: "assistant",
                            content: { type: "text", text: "Sales are growing." },
                            createdAt: 1,
                        });
                        controller.close();
                    },
                }),
            );

            const task = run.start();
            await vi.waitFor(() => expect(run.api[stage]).toHaveBeenCalledOnce());
            if (navigation === "existing") {
                run.store.dispatch(
                    setCurrentConversationAction({
                        conversation: { ...conversation, localId: "other-conversation" },
                    }),
                );
            } else {
                run.store.dispatch(startNewConversationAction());
                run.store.dispatch(setSelectedAgentAction({ agentId: "other-agent" }));
            }
            const selected = run.store.getState().messages;

            pending.resolve({ ...created, agentId: "original-agent" });
            await task.toPromise();

            const state = run.store.getState().messages;
            expect(state.currentConversation).toEqual(selected.currentConversation);
            expect(state.threadId).toBe(selected.threadId);
            expect(state.loaded).toBe(selected.loaded);
            expect(state.selectedAgentId).toBe(selected.selectedAgentId);
            expect(state.conversations?.find((item) => item.id === created.id)).toMatchObject({
                localId: draft.localId,
                agentId: "original-agent",
            });
            expect(run.api.getConversationThread).toHaveBeenCalledExactlyOnceWith(created.id);
            expect(run.messages().map((message) => message.role)).toEqual(["user", "assistant"]);
            expect(run.messages().at(-1)).toMatchObject({
                content: { type: "text", text: "Sales are growing." },
                complete: true,
                streaming: false,
            });
            expect(
                conversationMessagesByIdSelector(run.store.getState(), selected.currentConversation!.localId),
            ).toEqual([]);

            run.store.dispatch(activateConversationAction({ conversationId: created.id }));
            expect(run.store.getState().messages.currentConversation?.localId).toBe(draft.localId);
            expect(run.store.getState().messages.loaded).toBe(true);
            expect(run.messages().at(-1)?.content).toEqual({ type: "text", text: "Sales are growing." });
        },
    );

    it("keeps the newer conversation selected when two creations finish out of order", async () => {
        const run = setup({ current: draft });
        const pending = deferred<IChatConversation>();
        run.api.create
            .mockReturnValueOnce(pending.promise)
            .mockResolvedValueOnce({ ...created, id: "second-created" });
        run.api.update.mockImplementation(async (id, changes) => ({
            ...created,
            id,
            title: changes.title ?? "",
        }));
        const firstTask = run.start();

        run.store.dispatch(startNewConversationAction());
        const secondDraft = run.store.getState().messages.currentConversation!;
        const secondMessage = newMessageAction(makeUserItem({ type: "text", text: "Second question" }));
        run.store.dispatch(secondMessage);
        await run.start(secondMessage).toPromise();
        const selected = run.store.getState().messages.currentConversation;

        pending.resolve(created);
        await firstTask.toPromise();

        const state = run.store.getState().messages;
        expect(state.currentConversation).toEqual(selected);
        expect(state.currentConversation).toMatchObject({
            id: "second-created",
            localId: secondDraft.localId,
        });
        expect(state.threadId).toBe("second-created");
        expect(state.conversations).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: created.id, localId: draft.localId }),
                expect.objectContaining({ id: "second-created", localId: secondDraft.localId }),
            ]),
        );
        expect(state.conversations).toHaveLength(2);
        expect(run.messages().at(-1)?.complete).toBe(true);
        expect(
            conversationMessagesByIdSelector(run.store.getState(), secondDraft.localId).at(-1)?.complete,
        ).toBe(true);
        expect(run.api.getConversationThread.mock.calls).toEqual([["second-created"], [created.id]]);
    });

    it.each([
        { current: conversation, selectedAgentId: "other-agent", expected: conversation.agentId },
        {
            current: { ...conversation, agentId: undefined },
            selectedAgentId: "selected-agent",
            expected: "selected-agent",
        },
        { current: conversation, pendingAgentId: "next-agent", expected: "next-agent" },
        { current: draft, selectedAgentId: "selected-agent", expected: "selected-agent" },
        { current: { ...conversation, agentId: undefined }, expected: undefined },
    ])("captures the responding agent when evaluation starts: %j", async ({ expected, ...options }) => {
        const run = setup(options);
        await run.start().toPromise();

        expect(run.messages().at(-1)?.agentId).toBe(expected);
    });

    it("reuses persisted conversations without creating or renaming them", async () => {
        const run = setup();
        await run.start().toPromise();

        expect(run.api.create).not.toHaveBeenCalled();
        expect(run.api.update).not.toHaveBeenCalled();
        expect(run.api.switchAgent).not.toHaveBeenCalled();
        expect(run.api.getConversationThread).toHaveBeenCalledExactlyOnceWith(conversation.id);
        expect(run.getChatConversations).toHaveBeenCalledExactlyOnceWith();
        expect(run.actions.map((action) => action.type)).toEqual([
            evaluateMessageAction.type,
            evaluateMessageCompleteAction.type,
        ]);
    });

    it.each([
        { isPreview: false, selectedAgentId: "selected-agent", expected: { agentId: "selected-agent" } },
        { isPreview: false, selectedAgentId: undefined, expected: undefined },
        { isPreview: true, selectedAgentId: "selected-agent", expected: undefined },
    ])(
        "creates a draft with the existing agent/preview policy: %j",
        async ({ isPreview, selectedAgentId, expected }) => {
            const run = setup({ current: draft, isPreview, selectedAgentId });
            const pending = deferred<IChatConversation>();
            run.api.create.mockImplementationOnce(() => {
                run.trace.push("create");
                return pending.promise;
            });

            const task = run.start();
            expect(run.store.getState().messages.conversationsData[draft.localId].asyncProcess).toBe(
                "evaluating",
            );
            expect(run.messages().map((message) => message.role)).toEqual(["user", "assistant"]);
            expect(run.messages().at(-1)?.streaming).toBeUndefined();
            expect(run.api.update).not.toHaveBeenCalled();
            expect(run.query).not.toHaveBeenCalled();
            pending.resolve(created);
            await task.toPromise();

            expect(run.workspace).toHaveBeenCalledWith("workspace-1");
            expect(run.getChatConversations.mock.calls).toEqual([[{ isPreview }], []]);
            expect(run.api.create).toHaveBeenCalledExactlyOnceWith(expected);
            expect(run.api.create.mock.contexts[0]).toBe(run.api);
            expect(run.api.update).toHaveBeenCalledExactlyOnceWith(created.id, { title: "How are sales?" });
            expect(run.api.update.mock.contexts[0]).toBe(run.api);
            expect(run.api.getConversationThread).toHaveBeenCalledExactlyOnceWith(created.id);
            expect(run.store.getState().messages.currentConversation).toMatchObject({
                id: created.id,
                localId: draft.localId,
                title: "Server title",
                agentId: expected?.agentId,
            });
            expect(run.actions.filter(upsertConversationAction.match)[0].payload.conversation).toStrictEqual({
                ...created,
                localId: draft.localId,
                title: "Server title",
                agentId: expected?.agentId,
            });
            expect(run.trace).toEqual([
                evaluateMessageAction.type,
                "create",
                "update",
                upsertConversationAction.type,
                "reasoning",
                "query",
                "stream",
                "reasoning",
                evaluateMessageCompleteAction.type,
            ]);
            expect(run.actions.filter(evaluateMessageCompleteAction.match)[0].payload).toMatchObject({
                conversationId: draft.localId,
                threadId: created.id,
                cancelled: false,
                responseCompleted: true,
            });
        },
    );

    it.each([
        { createdAgentId: "created-agent", updatedAgentId: "updated-agent", expected: "updated-agent" },
        { createdAgentId: "created-agent", updatedAgentId: undefined, expected: "created-agent" },
        { createdAgentId: undefined, updatedAgentId: undefined, expected: "selected-agent" },
    ])("preserves creation agent precedence: %j", async ({ createdAgentId, updatedAgentId, expected }) => {
        const run = setup({ current: draft, selectedAgentId: "selected-agent" });
        run.api.create.mockResolvedValueOnce({ ...created, agentId: createdAgentId });
        run.api.update.mockResolvedValueOnce({ ...created, agentId: updatedAgentId });

        await run.start().toPromise();

        expect(run.store.getState().messages.currentConversation?.agentId).toBe(expected);
    });

    it("does not generate a title for clarifying answers", async () => {
        const run = setup({
            current: draft,
            content: { type: "clarifyingAnswers", questionsItemId: "questions", answers: [] },
        });

        await run.start().toPromise();

        expect(run.api.update).toHaveBeenCalledExactlyOnceWith(created.id, { title: undefined });
        expect(run.query).toHaveBeenCalledExactlyOnceWith({
            type: "clarifyingAnswers",
            questionsItemId: "questions",
            answers: [],
        });
    });

    it.each(["create", "update"] as const)(
        "keeps %s failures on the draft without starting a stream",
        async (stage) => {
            const run = setup({ current: draft });
            run.api[stage].mockRejectedValueOnce(new Error("Preparation failed"));

            await run.start().toPromise();

            expect(run.actions.map((action) => action.type)).toEqual([
                evaluateMessageAction.type,
                evaluateMessageErrorAction.type,
            ]);
            expect(run.messages().at(-1)?.content).toMatchObject({
                type: "error",
                message: "Error: Preparation failed",
            });
            expect(run.store.getState().messages.currentConversation?.id).toBe("");
            expect(run.query).not.toHaveBeenCalled();
            expect(run.dispatchEvent).not.toHaveBeenCalled();
        },
    );

    it("does not commit creation or start a stream after cancellation", async () => {
        const run = setup({ current: draft });
        const pending = deferred<IChatConversation>();
        run.api.create.mockReturnValueOnce(pending.promise);
        const task = run.start();

        task.cancel();
        await task.toPromise();
        pending.resolve(created);
        await Promise.resolve();

        expect(run.actions.map((action) => action.type)).toEqual([evaluateMessageAction.type]);
        expect(run.api.update).not.toHaveBeenCalled();
        expect(run.query).not.toHaveBeenCalled();
        expect(run.store.getState().messages.currentConversation?.id).toBe("");
    });
});

describe("onUserMessage deferred agent switching", () => {
    it.each([
        { navigateAway: false, pinned: false },
        { navigateAway: false, pinned: true },
        { navigateAway: true, pinned: false },
        { navigateAway: true, pinned: true },
    ])("preserves current metadata when an agent switch completes: %j", async ({ navigateAway, pinned }) => {
        const run = setup({ current: { ...conversation, pinned: !pinned }, pendingAgentId: "next-agent" });
        const pending = deferred<IChatConversation>();
        run.api.switchAgent.mockReturnValueOnce(pending.promise);
        const task = run.start();
        expect(run.api.switchAgent).toHaveBeenCalledOnce();

        run.store.dispatch(renameConversationSuccessAction({ conversation, title: "Renamed conversation" }));
        run.store.dispatch(pinConversationSuccessAction({ conversation, pinned }));
        if (navigateAway) {
            run.store.dispatch(startNewConversationAction());
            run.store.dispatch(setSelectedAgentAction({ agentId: "other-agent" }));
        }
        const selected = run.store.getState().messages;
        const switched = {
            ...conversation,
            id: "switched-conversation",
            agentId: "next-agent",
            pinned: !pinned,
            updatedAt: "2026-01-02T00:00:00Z",
        };

        pending.resolve(switched);
        await task.toPromise();

        const state = run.store.getState().messages;
        const expected = {
            ...conversation,
            id: switched.id,
            agentId: switched.agentId,
            title: "Renamed conversation",
            pinned,
            updatedAt: selected.conversations?.find((item) => item.localId === conversation.localId)
                ?.updatedAt,
            inProgress: false,
        };
        expect(state.conversations?.find((item) => item.localId === conversation.localId)).toEqual(expected);
        expect(state.currentConversation).toEqual(navigateAway ? selected.currentConversation : expected);
        expect(state.threadId).toBe(navigateAway ? selected.threadId : switched.id);
        expect(state.selectedAgentId).toBe(navigateAway ? "other-agent" : switched.agentId);
        expect(run.api.switchAgent).toHaveBeenCalledExactlyOnceWith(conversation.id, "next-agent");
        expect(run.api.getConversationThread).toHaveBeenCalledExactlyOnceWith(conversation.id);
        expect(run.messages().at(-1)?.complete).toBe(true);
    });

    it.each(["existing", "new"])(
        "does not select the switched conversation after navigating elsewhere (%s)",
        async (navigation) => {
            const run = setup({ pendingAgentId: "next-agent" });
            const pending = deferred<IChatConversation>();
            run.api.switchAgent.mockReturnValueOnce(pending.promise);
            const task = run.start();

            if (navigation === "existing") {
                run.store.dispatch(
                    setCurrentConversationAction({
                        conversation: {
                            ...conversation,
                            id: "other-server",
                            localId: "other-local",
                            agentId: "other-agent",
                        },
                    }),
                );
            } else {
                run.store.dispatch(startNewConversationAction());
                run.store.dispatch(setSelectedAgentAction({ agentId: "other-agent" }));
            }
            const selected = run.store.getState().messages;

            pending.resolve({ ...conversation, agentId: "next-agent" });
            await task.toPromise();

            const state = run.store.getState().messages;
            expect(state.currentConversation).toEqual(selected.currentConversation);
            expect(state.threadId).toBe(selected.threadId);
            expect(state.loaded).toBe(selected.loaded);
            expect(state.selectedAgentId).toBe("other-agent");
            expect(state.conversations?.find((item) => item.localId === conversation.localId)?.agentId).toBe(
                "next-agent",
            );
            expect(run.api.getConversationThread).toHaveBeenCalledExactlyOnceWith(conversation.id);
            expect(run.messages().at(-1)?.complete).toBe(true);
        },
    );

    it("blocks input and applies the switch before querying, preserving the runtime conversation ID", async () => {
        const run = setup({ pendingAgentId: "next-agent" });
        const pending = deferred<IChatConversation>();
        run.api.switchAgent.mockImplementationOnce(() => {
            run.trace.push("switch");
            return pending.promise;
        });

        const task = run.start();
        expect(run.messages().map((message) => message.role)).toEqual(["system", "user", "assistant"]);
        expect(run.store.getState().messages.conversationsData[conversation.localId].asyncProcess).toBe(
            "evaluating",
        );
        expect(run.query).not.toHaveBeenCalled();
        expect(run.api.switchAgent).toHaveBeenCalledExactlyOnceWith(conversation.id, "next-agent");
        expect(run.api.switchAgent.mock.contexts[0]).toBe(run.api);
        pending.resolve({ ...conversation, agentId: "next-agent" });
        await task.toPromise();

        expect(run.getChatConversations.mock.calls).toEqual([[{ isPreview: false }], []]);
        expect(run.actions.filter(applyPendingAgentSwitchAction.match)[0].payload).toEqual({
            conversationLocalId: conversation.localId,
            beforeItemLocalId: run.action.payload.localId,
        });
        expect(run.trace).toEqual([
            evaluateMessageAction.type,
            "reasoning",
            applyPendingAgentSwitchAction.type,
            "switch",
            upsertConversationAction.type,
            "query",
            "stream",
            "reasoning",
            evaluateMessageCompleteAction.type,
        ]);
        expect(run.store.getState().messages.currentConversation).toMatchObject({
            id: conversation.id,
            localId: conversation.localId,
            agentId: "next-agent",
        });
    });

    it("rolls back a rejected switch and errors the placeholder without querying", async () => {
        const error = new Error("Switch failed");
        const logged = vi.spyOn(console, "error").mockImplementation(() => {});
        const run = setup({ pendingAgentId: "next-agent" });
        run.api.switchAgent.mockRejectedValueOnce(error);

        await run.start().toPromise();

        expect(logged).toHaveBeenCalledExactlyOnceWith(
            "Failed to switch agent before sending message",
            error,
        );
        expect(run.actions.map((action) => action.type)).toEqual([
            evaluateMessageAction.type,
            applyPendingAgentSwitchAction.type,
            revertAgentSwitchAction.type,
            evaluateMessageErrorAction.type,
            evaluateMessageCompleteAction.type,
        ]);
        expect(run.actions.filter(revertAgentSwitchAction.match)[0].payload).toEqual({
            previousAgentId: "previous-agent",
            failedAgentId: "next-agent",
            conversationLocalId: conversation.localId,
        });
        expect(run.messages().map((message) => message.role)).toEqual(["user", "assistant"]);
        expect(run.messages().at(-1)).toMatchObject({
            content: { type: "error", message: "Error: Switch failed" },
            complete: true,
            streaming: false,
        });
        expect(run.actions.filter(evaluateMessageCompleteAction.match)[0].payload).toMatchObject({
            cancelled: false,
        });
        expect(run.actions.filter(evaluateMessageCompleteAction.match)[0].payload).not.toHaveProperty(
            "responseCompleted",
        );
        expect(run.query).not.toHaveBeenCalled();
        expect(run.store.getState().messages.currentConversation?.agentId).toBe("previous-agent");
        expect(
            run.store.getState().messages.conversationsData[conversation.localId].asyncProcess,
        ).toBeUndefined();
    });

    it("skips a pending switch defensively in preview mode", async () => {
        const run = setup({ pendingAgentId: "next-agent", isPreview: true });

        await run.start().toPromise();

        expect(run.api.switchAgent).not.toHaveBeenCalled();
        expect(run.actions.some(applyPendingAgentSwitchAction.match)).toBe(false);
        expect(
            run.store.getState().messages.conversationsData[conversation.localId].pendingAgentSwitch,
        ).toEqual({
            previousAgentId: "previous-agent",
            agentId: "next-agent",
        });
        expect(run.stream).toHaveBeenCalledOnce();
    });

    it("finalizes cancellation during a switch without rollback or a late query", async () => {
        const run = setup({ pendingAgentId: "next-agent" });
        const pending = deferred<IChatConversation>();
        run.api.switchAgent.mockReturnValueOnce(pending.promise);
        const task = run.start();

        task.cancel();
        await task.toPromise();
        pending.resolve({ ...conversation, agentId: "next-agent" });
        await Promise.resolve();

        expect(run.actions.map((action) => action.type)).toEqual([
            evaluateMessageAction.type,
            applyPendingAgentSwitchAction.type,
            evaluateMessageCompleteAction.type,
        ]);
        expect(run.actions.filter(evaluateMessageCompleteAction.match)[0].payload).toMatchObject({
            conversationId: conversation.localId,
            threadId: conversation.id,
            cancelled: true,
        });
        expect(run.actions.filter(evaluateMessageCompleteAction.match)[0].payload).not.toHaveProperty(
            "responseCompleted",
        );
        expect(run.query).not.toHaveBeenCalled();
        expect(run.messages().at(-1)).toMatchObject({ complete: true, streaming: false, cancelled: true });
    });
});
