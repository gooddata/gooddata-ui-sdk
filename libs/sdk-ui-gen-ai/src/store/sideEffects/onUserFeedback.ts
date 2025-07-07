// (C) 2024-2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, select } from "redux-saga/effects";
import { extractError } from "./utils.js";
import { GenAIChatInteractionUserFeedback } from "@gooddata/sdk-model";
import { messagesSelector } from "../messages/messagesSelectors.js";
import { Message } from "../../model.js";

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
}>) {
    try {
        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");
        const messages: Message[] = yield select(messagesSelector);
        const message = messages.find((message) => message.localId === payload.assistantMessageId);

        if (!message?.id) {
            return;
        }

        const chatThread = backend.workspace(workspace).genAI().getChatThread();

        yield call([chatThread, chatThread.saveUserFeedback], message.id, payload.feedback);
    } catch (e) {
        console.warn(`Failed to save user feedback: ${extractError(e)}`);
    }
}
