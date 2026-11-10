// (C) 2026 GoodData Corporation

import { type PayloadAction, type UnknownAction, configureStore } from "@reduxjs/toolkit";
import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { type IChatConversationItem } from "@gooddata/sdk-backend-spi";
import { type IDashboard } from "@gooddata/sdk-model";

import { type IChatConversationLocal, makeConversationItem } from "../../model.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { chatWindowSliceReducer, onDefinitionReceivedAction } from "../chatWindow/chatWindowSlice.js";
import {
    asyncProcessSelector,
    conversationMessagesSelector,
    conversationSelector,
    loadedSelector,
} from "../messages/messagesSelectors.js";
import {
    activateConversationAction,
    loadConversationsSuccessAction,
    messagesSliceReducer,
    setCurrentConversationAction,
    setMessagesAction,
    startNewConversationAction,
} from "../messages/messagesSlice.js";

import { consumeStaleConversationSession } from "./conversationSession.js";
import { onChatOpenSync } from "./onChatOpenSync.js";

// Drives the saga generator without redux-saga's runtime: SELECT effects are answered from a
// per-selector queue (so a selector sampled twice can return different values across the await),
// CALL effects are answered in order from `callResults`, and PUT actions are collected. The
// session-staleness CALL is matched by reference, so it stays out of the positional queue.
function runOnChatOpenSync({
    isOpen,
    selects,
    callResults,
    staleSession = false,
}: {
    isOpen: boolean;
    selects: Map<unknown, unknown[]>;
    callResults: unknown[];
    staleSession?: boolean;
}): PayloadAction[] {
    // Loosely typed so the manual driver can feed SELECT/CALL results into next() regardless of the
    // saga's inferred effect types.
    const gen: Generator<{ type: string; payload: any }, void, unknown> = onChatOpenSync({
        type: "x",
        payload: { isOpen },
    } as PayloadAction<{ isOpen: boolean }>) as unknown as Generator<
        { type: string; payload: any },
        void,
        unknown
    >;
    const puts: PayloadAction[] = [];
    let callIndex = 0;
    let next = gen.next();
    while (!next.done) {
        const effect = next.value as { type: string; payload: any };
        if (effect.type === "SELECT") {
            const queue = selects.get(effect.payload.selector);
            if (!queue || queue.length === 0) {
                throw new Error("Unexpected SELECT with no queued value");
            }
            next = gen.next(queue.shift());
        } else if (effect.type === "CALL") {
            if (effect.payload.fn === consumeStaleConversationSession) {
                next = gen.next(staleSession);
                continue;
            }
            const result = callResults[callIndex++];
            if (result instanceof Error) {
                next = gen.throw(result);
            } else {
                next = gen.next(result);
            }
        } else if (effect.type === "PUT") {
            puts.push(effect.payload.action);
            next = gen.next();
        } else {
            next = gen.next();
        }
    }
    return puts;
}

const conv = (id: string, localId = id): IChatConversationLocal =>
    ({ id, localId, updatedAt: "2026-01-01T00:00:00.000Z" }) as IChatConversationLocal;

const AGENTIC_SETTINGS = { enableAiAgenticConversations: true };

describe("onChatOpenSync", () => {
    it.each(["server-id", "temporary-id"])(
        "keeps an explicitly activated conversation with local ID %s instead of the latest one",
        async (localId) => {
            const requested = conv("server-id", localId);
            const latest = { ...conv("newer-conversation"), updatedAt: "2026-02-01T00:00:00.000Z" };
            const store = configureStore({
                reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
            });
            store.dispatch(loadConversationsSuccessAction({ conversations: [requested, latest] }));
            store.dispatch(activateConversationAction({ conversationId: requested.id }));
            store.dispatch(setMessagesAction({ items: [] }));
            const loadHistory = vi.fn(async () => []);
            const getConversationThread = vi.fn(() => ({ loadHistory }));
            const query = {
                withSize: () => query,
                withPage: () => query,
                query: async () => ({ items: [{ ...requested, localId: requested.id }, latest] }),
            };
            const backend = {
                workspace: () => ({
                    genAI: () => ({
                        getChatConversations: () => ({
                            getConversationItemsQuery: () => query,
                            getConversationThread,
                        }),
                    }),
                }),
            };

            await runSaga(
                {
                    context: { backend, workspace: "workspace-1" },
                    dispatch: (action) => store.dispatch(action as UnknownAction),
                    getState: store.getState,
                },
                onChatOpenSync,
                { type: "open", payload: { isOpen: true } },
            ).toPromise();

            expect(getConversationThread).toHaveBeenCalledExactlyOnceWith(requested.id);
            expect(loadHistory).toHaveBeenCalledOnce();
            expect(store.getState().messages.currentConversation).toEqual(requested);
        },
    );

    it("preserves the latest conversation's runtime local ID when current is absent from the fetched page", async () => {
        const current = conv("current-conversation");
        const latest = conv("T", "L");
        const item: IChatConversationItem = {
            id: "dashboard-item",
            type: "item",
            role: "assistant",
            createdAt: 1,
            responseId: "dashboard-response",
            content: {
                type: "multipart",
                parts: [
                    {
                        type: "dashboard",
                        dashboard: { identifier: "draft-dashboard" } as IDashboard,
                        insights: null,
                    },
                ],
            },
        };
        const store = configureStore({
            reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
        });
        store.dispatch(loadConversationsSuccessAction({ conversations: [current, latest] }));
        store.dispatch(setCurrentConversationAction({ conversation: latest }));
        store.dispatch(setMessagesAction({ items: [makeConversationItem(item)] }));
        store.dispatch(setCurrentConversationAction({ conversation: current }));
        store.dispatch(setMessagesAction({ items: [] }));
        const loadHistory = vi.fn(async () => [item]);
        const getConversationThread = vi.fn(() => ({ loadHistory }));
        const query = {
            withSize: () => query,
            withPage: () => query,
            query: async () => ({ items: [{ ...latest, localId: latest.id }] }),
        };
        const backend = {
            workspace: () => ({
                genAI: () => ({
                    getChatConversations: () => ({
                        getConversationItemsQuery: () => query,
                        getConversationThread,
                    }),
                }),
            }),
        };
        const dispatch = vi.fn((action: UnknownAction) => store.dispatch(action));

        await runSaga(
            {
                context: { backend, workspace: "workspace-1" },
                dispatch,
                getState: store.getState,
            },
            onChatOpenSync,
            { type: "open", payload: { isOpen: true } },
        ).toPromise();

        const state = store.getState().messages;
        expect(getConversationThread).toHaveBeenCalledExactlyOnceWith(latest.id);
        expect(state.currentConversation).toEqual(latest);
        expect(state.conversations).toEqual([latest]);
        expect(state.conversationsData).not.toHaveProperty(latest.id);
        const data = state.conversationsData[latest.localId];
        expect(data.order).toHaveLength(1);
        expect(data.items[data.order[0]]).toMatchObject({ id: item.id, responseId: item.responseId });
        expect(dispatch).toHaveBeenCalledWith(
            onDefinitionReceivedAction({
                conversationId: latest.localId,
                interactionId: item.responseId,
                itemId: item.id,
                definitionType: "dashboard",
                dashboard: { identifier: "draft-dashboard" } as IDashboard,
                insights: [],
            }),
        );
    });

    it("does not overwrite an explicit conversation selection made during the fetch", () => {
        const current = conv("conv-a");
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [current, [{ id: "old-item", localId: "old-item" }]],
            selects: new Map<unknown, unknown[]>([
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, conv("requested-conversation")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        expect(puts).toHaveLength(0);
    });

    it("syncs to the latest conversation when nothing changed during the fetch", () => {
        const latest = conv("conv-c");
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [latest, [{ id: "i1", localId: "i1" }], undefined],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                // sampled twice: pre-fetch guard, then post-fetch re-check
                [asyncProcessSelector, [undefined, undefined]],
                // current (pre-fetch) then currentNow (post-fetch) — both the persisted conv-a
                [conversationSelector, [conv("conv-a"), conv("conv-a")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).toContain(setCurrentConversationAction.type);
        expect(types).toContain(setMessagesAction.type);
    });

    it("does NOT switch when a fresh draft was started during the fetch (LX-2577)", () => {
        const latest = conv("conv-b");
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [latest, [{ localId: "i1" }]],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                // pre-fetch: previous persisted conversation; post-fetch: a fresh unsent draft (no id)
                [conversationSelector, [conv("conv-b"), conv("", "draft-1")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).not.toContain(setCurrentConversationAction.type);
        expect(types).not.toContain(setMessagesAction.type);
    });

    it("updates messages when conversation is the same but items changed", () => {
        const current = conv("conv-a");
        const items = [
            { id: "i1", localId: "i1" },
            { id: "i2", localId: "i2" },
        ];
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [current, items, undefined],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, current]],
                [conversationMessagesSelector, [[{ id: "i1", localId: "i1" }]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).not.toContain(setCurrentConversationAction.type);
        expect(types).toContain(setMessagesAction.type);
    });

    it("does NOT update messages when conversation and items are the same", () => {
        const current = conv("conv-a");
        const items = [{ id: "i1", localId: "i1" }];
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [current, items],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, current]],
                [conversationMessagesSelector, [[{ id: "i1", localId: "i1" }]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).not.toContain(setCurrentConversationAction.type);
        expect(types).not.toContain(setMessagesAction.type);
    });

    it("does NOT switch or update when chat is opened but another process starts during fetch (LX-2577)", () => {
        const latest = conv("conv-b");
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [latest, [{ id: "i1", localId: "i1" }]],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined, "evaluating"]], // process started during fetch
                [conversationSelector, [conv("conv-a"), conv("conv-a")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        expect(puts).toHaveLength(0);
    });

    it("fails silently when backend call fails", () => {
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [new Error("Failed to fetch")],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [conv("conv-a"), conv("conv-a")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        expect(puts).toHaveLength(0);
    });

    it("updates messages when backend returns FEWER items than cached", () => {
        const current = conv("conv-a");
        const items = [{ id: "i1", localId: "i1" }];
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [current, items, undefined],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, current]],
                [
                    conversationMessagesSelector,
                    [
                        [
                            { id: "i1", localId: "i1" },
                            { id: "i2", localId: "i2" },
                        ],
                    ],
                ],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).toContain(setMessagesAction.type);
    });

    it("does not consume the session timer while onThreadLoad is still in flight (GDAI-2142)", () => {
        const puts = runOnChatOpenSync({
            isOpen: true,
            staleSession: true,
            callResults: [],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [false]],
            ]),
        });

        expect(puts).toHaveLength(0);
    });

    it("starts a new conversation instead of re-syncing when the session went stale (GDAI-2142)", () => {
        const puts = runOnChatOpenSync({
            isOpen: true,
            staleSession: true,
            callResults: [],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined]],
                [conversationSelector, [conv("conv-a")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        expect(puts.map((a) => a.type)).toEqual([startNewConversationAction.type]);
    });

    it("updates messages when conversation switches even if item IDs match", () => {
        const current = conv("conv-a");
        const latest = conv("conv-b");
        const items = [{ id: "i1", localId: "i1" }];
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [latest, items, undefined],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [loadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, current]],
                [conversationMessagesSelector, [[{ id: "i1", localId: "i1" }]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).toContain(setCurrentConversationAction.type);
        expect(types).toContain(setMessagesAction.type);
    });
});
