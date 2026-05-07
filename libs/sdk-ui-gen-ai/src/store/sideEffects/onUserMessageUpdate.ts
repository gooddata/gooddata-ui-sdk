// (C) 2026 GoodData Corporation

import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { conversationByIdSelector } from "../messages/messagesSelectors.js";
import {
    evaluateConversationTitleAction,
    type evaluateMessageUpdateAction,
} from "../messages/messagesSlice.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onUserMessageUpdate({ payload }: ReturnType<typeof evaluateMessageUpdateAction>) {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");

    if (!payload.isStartMessage) {
        return;
    }

    const conversation: IChatConversationLocal = yield select(
        conversationByIdSelector,
        payload.conversation.id,
    );

    if (!conversation) {
        return;
    }

    if (conversation.generatingTitle) {
        return;
    }

    yield put(
        evaluateConversationTitleAction({
            conversation: conversation,
            generatingTitle: true,
        }),
    );

    try {
        const conversationsCall = backend.workspace(workspace).genAI().getChatConversations();

        const updated: IChatConversationLocal = yield call(
            conversationsCall.generateTitle.bind(conversationsCall),
            payload.conversation.id,
        );

        yield put(
            evaluateConversationTitleAction({
                conversation: updated,
                generatingTitle: false,
                title: updated.title,
            }),
        );
    } catch {
        yield put(
            evaluateConversationTitleAction({
                conversation: conversation,
                generatingTitle: false,
            }),
        );
    }
}
