// (C) 2024-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { getContext, put, select } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatConversation,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { type GenAIChatInteractionUserFeedback } from "@gooddata/sdk-model";

import { extractError } from "./utils.js";
import { type IChatConversationLocalItem, type Message } from "../../model.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    conversationMessagesSelector,
    conversationSelector,
    messagesSelector,
} from "../messages/messagesSelectors.js";
import { setUserFeedbackError } from "../messages/messagesSlice.js";

/**
 * Save user feedback to server.
 * Optimistic update, ignoring the error.
 * @internal
 */
export function* onUserFeedback({
    payload,
}: PayloadAction<{
    assistantMessageId: string;
    feedback: GenAIChatInteractionUserFeedback;
    userTextFeedback?: string;
}>) {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);

    if (settings?.enableAiAgenticConversations) {
        try {
            const conversation: IChatConversation = yield select(conversationSelector);
            const messages: IChatConversationLocalItem[] = yield select(conversationMessagesSelector);
            const message = messages.find((message) => message.localId === payload.assistantMessageId);

            if (!message?.id) {
                return;
            }

            const chatThread = backend
                .workspace(workspace)
                .genAI()
                .getChatConversations()
                .getConversationThread(conversation.id);

            yield chatThread.saveFeedback(message.responseId, payload.feedback, payload.userTextFeedback);
        } catch (e) {
            console.warn(`Failed to save user feedback: ${extractError(e)}`);

            // Dispatch error action to notify UI
            yield put(
                setUserFeedbackError({
                    assistantMessageId: payload.assistantMessageId,
                    error: extractError(e),
                }),
            );
        }
    } else {
        try {
            const messages: Message[] = yield select(messagesSelector);
            const message = messages.find((message) => message.localId === payload.assistantMessageId);

            if (!message?.id) {
                return;
            }

            const chatThread = backend.workspace(workspace).genAI().getChatThread();

            yield chatThread.saveUserFeedback(message.id, payload.feedback, payload.userTextFeedback);
        } catch (e) {
            console.warn(`Failed to save user feedback: ${extractError(e)}`);

            // Dispatch error action to notify UI
            yield put(
                setUserFeedbackError({
                    assistantMessageId: payload.assistantMessageId,
                    error: extractError(e),
                }),
            );
        }
    }
}
