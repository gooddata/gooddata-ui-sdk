// (C) 2026 GoodData Corporation

import { call, getContext, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import type { IChatConversationLocal } from "../../model.js";
import { conversationByIdOrLocalIdSelector } from "../messages/messagesSelectors.js";
import { type publisherDocumentSavedAction } from "../messages/messagesSlice.js";

export function* onPublisherDocumentSaved({ payload }: ReturnType<typeof publisherDocumentSavedAction>) {
    if (payload.documentRef === undefined) {
        return;
    }

    const conversation: IChatConversationLocal | undefined = yield select(
        conversationByIdOrLocalIdSelector,
        payload.conversationId,
    );
    if (!conversation) {
        return;
    }

    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    try {
        const thread = backend
            .workspace(workspace)
            .genAI()
            .getChatConversations({ isPreview })
            .getConversationThread(conversation.id);

        yield call(thread.resavePublisherDocument.bind(thread), payload.documentRef, payload.savedDocumentId);
    } catch (error) {
        console.error("Failed to notify GenAI about the saved publisher document", error);
    }
}
