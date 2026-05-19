// (C) 2024-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { conversationByIdSelector } from "../messages/messagesSelectors.js";
import {
    type renameConversationAction,
    renameConversationFailureAction,
    renameConversationSuccessAction,
} from "../messages/messagesSlice.js";

export function* onConversationRename({
    payload,
}: ReturnType<typeof renameConversationAction> | PayloadAction<{ conversationId: string; title: string }>) {
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    const conversation: IChatConversationLocal | undefined = yield select(
        conversationByIdSelector,
        payload.conversationId,
    );

    if (!conversation) {
        return;
    }

    try {
        yield put(
            renameConversationSuccessAction({
                conversationId: payload.conversationId,
                title: payload.title,
            }),
        );

        const chatConversations = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
        const updateConversationCall = chatConversations.update.bind(chatConversations);
        yield call(updateConversationCall, conversation.id, { title: payload.title });
    } catch (e) {
        console.error("Failed to rename conversation", e);
        yield put(
            renameConversationFailureAction({
                conversationId: payload.conversationId,
                error: e as Error,
                title: conversation.title,
            }),
        );
    }
}
