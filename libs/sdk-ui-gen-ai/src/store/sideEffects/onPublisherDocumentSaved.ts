// (C) 2026 GoodData Corporation

import { call, getContext, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IUserWorkspaceSettings } from "@gooddata/sdk-model";

import type { IChatConversationLocal, IChatConversationLocalItem } from "../../model.js";
import {
    findPublisherDocumentPart,
    publisherDocumentFormatOf,
    publisherDocumentPartFormat,
} from "../../publisherDocumentPart.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    conversationByIdOrLocalIdSelector,
    conversationMessagesByIdSelector,
} from "../messages/messagesSelectors.js";
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

    const messages: IChatConversationLocalItem[] = yield select(
        conversationMessagesByIdSelector,
        conversation.localId,
    );
    const content = messages.find((message) => message.id === payload.itemId)?.content;
    const part =
        content?.type === "multipart"
            ? findPublisherDocumentPart(content.parts, payload.documentRef)
            : undefined;
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
    const format =
        payload.format ?? (part ? publisherDocumentPartFormat(part) : publisherDocumentFormatOf(settings));

    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    try {
        const thread = backend
            .workspace(workspace)
            .genAI()
            .getChatConversations({ isPreview })
            .getConversationThread(conversation.id);

        yield call(
            thread.resavePublisherDocument.bind(thread),
            payload.documentRef,
            payload.savedDocumentId,
            {
                format,
            },
        );
    } catch (error) {
        console.error("Failed to notify GenAI about the saved publisher document", error);
    }
}
