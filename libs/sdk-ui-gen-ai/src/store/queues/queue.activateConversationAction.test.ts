// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import { type IChatConversationLocal } from "../../model.js";
import {
    activateConversationAction,
    clearConversationSuccessAction,
    loadConversationsSuccessAction,
    messagesSliceReducer,
    setCurrentConversationAction,
    startNewConversationAction,
} from "../messages/messagesSlice.js";

import { queueActivateConversationMiddleware } from "./queue.activateConversationAction.js";

const makeConversation = (id: string, localId = id): IChatConversationLocal => ({
    id,
    localId,
    title: id,
    createdAt: new Date(1).toISOString(),
    updatedAt: new Date(1).toISOString(),
    agentId: "gold",
});

const makeStore = () =>
    configureStore({
        reducer: { messages: messagesSliceReducer },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().prepend(queueActivateConversationMiddleware),
    });

describe("activate conversation queue middleware", () => {
    it("activates the requested conversation as soon as metadata loads", () => {
        const conversation = makeConversation("conversation-1");
        const store = makeStore();

        store.dispatch(activateConversationAction({ conversationId: conversation.id }));
        expect(store.getState().messages.currentConversation).toBeUndefined();

        store.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));

        expect(store.getState().messages.currentConversation).toEqual(conversation);
        expect(store.getState().messages.loaded).toBe(false);
    });

    it("keeps only the most recent activation request", () => {
        const first = makeConversation("conversation-1");
        const latest = makeConversation("conversation-2");
        const store = makeStore();

        store.dispatch(activateConversationAction({ conversationId: first.id }));
        store.dispatch(activateConversationAction({ conversationId: latest.id }));
        store.dispatch(loadConversationsSuccessAction({ conversations: [first, latest] }));

        expect(store.getState().messages.currentConversation).toEqual(latest);
    });

    it.each(["server-id", "local-id"])("resolves queued activation by %s", (idType) => {
        const conversation = makeConversation("server-id", "local-id");
        const conversationId = idType === "server-id" ? conversation.id : conversation.localId;
        const store = makeStore();

        store.dispatch(activateConversationAction({ conversationId }));
        store.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));

        expect(store.getState().messages.currentConversation).toEqual(conversation);
    });

    it("activates immediately when conversation metadata is already loaded", () => {
        const conversation = makeConversation("server-id", "local-id");
        const store = makeStore();
        store.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));

        store.dispatch(activateConversationAction({ conversationId: "local-id" }));

        expect(store.getState().messages.currentConversation).toEqual(conversation);
    });

    it("settles an activation request when the conversation is not in the loaded list", () => {
        const store = makeStore();
        store.dispatch(activateConversationAction({ conversationId: "missing" }));

        store.dispatch(loadConversationsSuccessAction({ conversations: [] }));

        expect(store.getState().messages.currentConversation).toBeUndefined();
    });

    it.each(["select", "start-new", "clear-success"] as const)(
        "cancels queued activation after %s navigation",
        (navigation) => {
            const requested = makeConversation("requested");
            const selected = makeConversation("selected");
            const store = makeStore();
            store.dispatch(activateConversationAction({ conversationId: requested.id }));

            const navigationAction = {
                select: setCurrentConversationAction({ conversation: selected }),
                "start-new": startNewConversationAction(),
                "clear-success": clearConversationSuccessAction({
                    conversation: selected,
                    threadId: selected.id,
                }),
            }[navigation];
            store.dispatch(navigationAction);

            store.dispatch(loadConversationsSuccessAction({ conversations: [requested, selected] }));

            expect(store.getState().messages.currentConversation?.id).toBe(
                navigation === "start-new" ? "" : selected.id,
            );
        },
    );

    it("keeps queued activations isolated to their store", () => {
        const conversation = makeConversation("conversation-1");
        const firstStore = makeStore();
        const secondStore = makeStore();

        firstStore.dispatch(activateConversationAction({ conversationId: conversation.id }));
        secondStore.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));

        expect(secondStore.getState().messages.currentConversation).toBeUndefined();
        expect(firstStore.getState().messages.currentConversation).toBeUndefined();

        firstStore.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));
        expect(firstStore.getState().messages.currentConversation).toEqual(conversation);
    });
});
