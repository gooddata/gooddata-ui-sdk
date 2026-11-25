// (C) 2026 GoodData Corporation

import { type UnknownAction, configureStore } from "@reduxjs/toolkit";
import { runSaga } from "redux-saga";
import { call } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type IChatConversationContent, type IChatConversationItem } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { chatWindowSliceReducer } from "../chatWindow/chatWindowSlice.js";
import { conversationMessagesSelector } from "../messages/messagesSelectors.js";
import {
    loadConversationsSuccessAction,
    messagesSliceReducer,
    setCurrentConversationAction,
    setMessagesAction,
} from "../messages/messagesSlice.js";

import { onChatOpenSync } from "./onChatOpenSync.js";
import { onThreadLoad } from "./onThreadLoad.js";

const clarificationContent: IChatConversationContent = {
    type: "multipart",
    parts: [
        { type: "text", text: "Please clarify" },
        { type: "clarifyingQuestions", questions: [] },
    ],
};

describe.each(["onThreadLoad", "onChatOpenSync"] as const)("%s history mapping", (loader) => {
    it.each([
        { name: "clarification", content: clarificationContent, filled: false },
        { name: "text", content: { type: "text", text: "Done" }, filled: true },
        {
            name: "visualization",
            content: {
                type: "multipart",
                parts: [{ type: "visualization", visualization: null, unsupportedChartType: "combo_chart" }],
            },
            filled: true,
        },
    ] satisfies { name: string; content: IChatConversationContent; filled: boolean }[])(
        "preserves item order and local defaults with a final $name item",
        async ({ content, filled }) => {
            const conversation: IChatConversationLocal = {
                id: "conversation",
                localId: "local-conversation",
                title: "Conversation",
                createdAt: new Date(1).toISOString(),
                updatedAt: new Date(1).toISOString(),
            };
            const history: IChatConversationItem[] = [
                {
                    type: "item",
                    id: "earlier-clarification",
                    responseId: "response-1",
                    createdAt: 1,
                    role: "assistant",
                    content: clarificationContent,
                },
                {
                    type: "item",
                    id: "agent-switch",
                    responseId: "response-2",
                    createdAt: 2,
                    role: "system",
                    agentId: "new-agent",
                    oldAgentId: "old-agent",
                    content: { type: "text", text: "" },
                },
                {
                    type: "item",
                    id: "final-item",
                    responseId: "response-3",
                    createdAt: 3,
                    role: "assistant",
                    content,
                },
            ];
            const query = {
                withSize: () => query,
                withPage: () => query,
                query: async () => ({ items: [conversation] }),
            };
            const backend = {
                workspace: () => ({
                    genAI: () => ({
                        getChatConversations: () => ({
                            getConversationItemsQuery: () => query,
                            getConversationThread: () => ({ loadHistory: async () => history }),
                        }),
                    }),
                }),
            };
            const store = configureStore({
                reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
            });
            store.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));
            store.dispatch(setCurrentConversationAction({ conversation }));
            store.dispatch(setMessagesAction({ items: [] }));

            await runSaga(
                {
                    context: { backend, workspace: "workspace" },
                    dispatch: (action) => store.dispatch(action as UnknownAction),
                    getState: store.getState,
                },
                function* () {
                    if (loader === "onThreadLoad") {
                        yield call(onThreadLoad);
                    } else {
                        yield call(onChatOpenSync, { type: "open", payload: { isOpen: true } });
                    }
                },
            ).toPromise();

            const items = conversationMessagesSelector(store.getState());
            expect(items).toEqual(
                history.map((item, index) => ({
                    ...item,
                    content:
                        index === 2 && content.type === "multipart" && filled
                            ? { ...content, parts: [{ ...content.parts[0], reporting: true }] }
                            : item.content,
                    localId: expect.any(String),
                    complete: true,
                    filled: index === 2 ? filled : true,
                })),
            );
            expect(new Set(items.map((item) => item.localId)).size).toBe(history.length);
        },
    );
});
