// (C) 2026 GoodData Corporation

import { type UnknownAction, configureStore } from "@reduxjs/toolkit";
import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { type IChatConversationItem } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { chatWindowSliceReducer } from "../chatWindow/chatWindowSlice.js";
import { activateConversationAction, messagesSliceReducer } from "../messages/messagesSlice.js";
import { queueActivateConversationMiddleware } from "../queues/queue.activateConversationAction.js";

import { onThreadLoad } from "./onThreadLoad.js";

const makeConversation = (id: string): IChatConversationLocal => ({
    id,
    localId: id,
    title: id,
    createdAt: new Date(1).toISOString(),
    updatedAt: new Date(1).toISOString(),
    agentId: "gold",
});

describe("onThreadLoad", () => {
    it("loads the requested conversation after its metadata arrives", async () => {
        const conversation = makeConversation("conversation-1");
        const moreRecentConversation = {
            ...makeConversation("conversation-2"),
            updatedAt: new Date(2).toISOString(),
        };
        const loadHistory = vi.fn(async () => [] as IChatConversationItem[]);
        const getConversationThread = vi.fn(() => ({ loadHistory }));
        const query = {
            withSize: () => query,
            withPage: () => query,
            query: async () => ({ items: [conversation, moreRecentConversation] }),
        };
        const conversationsApi = {
            getConversationItemsQuery: () => query,
            getConversationThread,
        };
        const backend = {
            workspace: () => ({
                genAI: () => ({
                    getChatConversations: () => conversationsApi,
                }),
            }),
        };
        const store = configureStore({
            reducer: {
                messages: messagesSliceReducer,
                chatWindow: chatWindowSliceReducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().prepend(queueActivateConversationMiddleware),
        });
        store.dispatch(activateConversationAction({ conversationId: conversation.id }));

        await runSaga(
            {
                context: { backend, workspace: "workspace-1" },
                dispatch: (action) => store.dispatch(action as UnknownAction),
                getState: store.getState,
            },
            onThreadLoad,
        ).toPromise();

        expect(loadHistory).toHaveBeenCalledOnce();
        expect(conversationsApi.getConversationThread).toHaveBeenCalledWith(conversation.id);
        expect(store.getState().messages.currentConversation).toEqual(conversation);
        expect(store.getState().messages.loaded).toBe(true);
    });
});
