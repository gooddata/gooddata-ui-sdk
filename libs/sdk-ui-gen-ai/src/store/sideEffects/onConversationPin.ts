// (C) 2024-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { conversationByIdSelector } from "../messages/messagesSelectors.js";
import {
    type pinConversationAction,
    pinConversationFailureAction,
    pinConversationSuccessAction,
} from "../messages/messagesSlice.js";

export function* onConversationPin({
    payload,
}: ReturnType<typeof pinConversationAction> | PayloadAction<{ conversationId: string; pinned: boolean }>) {
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
            pinConversationSuccessAction({
                conversationId: payload.conversationId,
                pinned: payload.pinned,
            }),
        );

        const chatConversations = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
        const updateConversationCall = chatConversations.update.bind(chatConversations);
        yield call(updateConversationCall, payload.conversationId, { pinned: payload.pinned });
    } catch (e) {
        console.error("Failed to update pinned state of conversation", e);
        yield put(
            pinConversationFailureAction({
                conversationId: payload.conversationId,
                error: e as Error,
                pinned: conversation.pinned,
            }),
        );
    }
}
