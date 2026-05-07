// (C) 2024-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { conversationByIdSelector } from "../messages/messagesSelectors.js";
import {
    deleteConversationFailureAction,
    deleteConversationStartAction,
    deleteConversationSuccessAction,
} from "../messages/messagesSlice.js";

export function* onConversationDelete({
    payload,
}: PayloadAction<{
    conversationId: string;
}>) {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");

    const conversation: IChatConversationLocal | undefined = yield select(
        conversationByIdSelector,
        payload.conversationId,
    );

    if (!conversation) {
        return;
    }

    yield put(
        deleteConversationStartAction({
            conversationId: payload.conversationId,
        }),
    );

    try {
        const chatConversations = backend.workspace(workspace).genAI().getChatConversations();
        const deleteConversationCall = chatConversations.delete.bind(chatConversations);
        yield call(deleteConversationCall, payload.conversationId);

        yield put(
            deleteConversationSuccessAction({
                conversationId: payload.conversationId,
            }),
        );
    } catch (e) {
        console.error("Failed to delete conversation", e);
        yield put(
            deleteConversationFailureAction({
                conversation: conversation,
                error: e as Error,
            }),
        );
    }
}
