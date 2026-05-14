// (C) 2024-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IChatConversationLocal, type IChatConversationLocalItem, type Message } from "../../model.js";
import { type RootState } from "../types.js";

import { messagesSliceName } from "./messagesSlice.js";

const messagesSliceSelector = (state: RootState) => state[messagesSliceName];

export const messagesSelector: (state: RootState) => Message[] = createSelector(
    messagesSliceSelector,
    (state) => state.messageOrder.map((id) => state.messages[id]),
);

export const loadedSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => state.loaded,
);

export const isVerboseSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => state.verbose,
);

export const lastMessageSelector: (state: RootState) => Message | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.messages[state.messageOrder[state.messageOrder.length - 1]],
);

export const hasMessagesSelector: (state: RootState) => boolean = createSelector(
    messagesSliceSelector,
    (state) => {
        if (state.messageOrder.length > 0) {
            return true;
        }
        const data = state.conversationsData[state.currentConversation?.localId ?? ""];
        return (data?.order ?? []).length > 0;
    },
);

export const asyncProcessSelector: (
    state: RootState,
) => "loading" | "restoring" | "clearing" | "evaluating" | undefined = createSelector(
    messagesSliceSelector,
    (state) => {
        if (state.currentConversation) {
            const data = state.conversationsData[state.currentConversation.localId];
            return data?.asyncProcess;
        }
        return state.messageAsyncProcess;
    },
);

export const globalErrorSelector: (state: RootState) => Record<string, unknown> | null = createSelector(
    messagesSliceSelector,
    (state) => state.globalError ?? null,
);

export const threadIdSelector: (state: RootState) => string | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.threadId,
);

export const conversationMessagesSelector: (state: RootState) => IChatConversationLocalItem[] =
    createSelector(messagesSliceSelector, (state) => {
        const data = state.conversationsData[state.currentConversation?.localId ?? ""];
        return data?.order.map((id) => data.items[id]) ?? [];
    });

export const conversationMessagesByIdSelector: (
    state: RootState,
    conversationId?: string,
) => IChatConversationLocalItem[] = createSelector(
    [messagesSliceSelector, (_state: RootState, conversationId?: string) => conversationId],
    (state, conversationId) => {
        const data = state.conversationsData[conversationId ?? ""];
        if (!data) {
            return [];
        }

        return data.order.map((id) => data.items[id]);
    },
);

export const conversationSelector: (state: RootState) => IChatConversationLocal | undefined = createSelector(
    messagesSliceSelector,
    (state) => state.currentConversation,
);

export const conversationByIdSelector: (
    state: RootState,
    conversationId: string,
) => IChatConversationLocal | undefined = createSelector(
    [messagesSliceSelector, (_state: RootState, conversationId: string) => conversationId],
    (state, conversationId) =>
        state.conversations?.find((conversation) => conversation.localId === conversationId),
);

export const conversationsSelector: (state: RootState) => IChatConversationLocal[] | undefined =
    createSelector(messagesSliceSelector, (state) => state.conversations);
