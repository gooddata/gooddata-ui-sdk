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
}:
    | ReturnType<typeof pinConversationAction>
    | PayloadAction<{ conversation: IChatConversationLocal; pinned: boolean }>) {
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    const conversation: IChatConversationLocal | undefined = yield select(
        conversationByIdSelector,
        payload.conversation.localId,
    );

    if (!conversation) {
        return;
    }

    try {
        yield put(
            pinConversationSuccessAction({
                conversation: payload.conversation,
                pinned: payload.pinned,
            }),
        );

        const chatConversations = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
        const updateConversationCall = chatConversations.update.bind(chatConversations);
        yield call(updateConversationCall, payload.conversation.id, { pinned: payload.pinned });
    } catch (e) {
        console.error("Failed to update pinned state of conversation", e);
        yield put(
            pinConversationFailureAction({
                conversation: payload.conversation,
                error: e as Error,
                pinned: conversation.pinned,
            }),
        );
    }
}
