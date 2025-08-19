// (C) 2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, select } from "redux-saga/effects";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { GenAIChatInteractionUserVisualisation } from "@gooddata/sdk-model";

import { Message } from "../../model.js";
import { getVisualizationHref } from "../../utils.js";
import { messagesSelector } from "../messages/messagesSelectors.js";

export function* onVisualizationSuccessSave({
    payload,
}: PayloadAction<{
    visualizationId: string;
    assistantMessageId: string;
    savedVisualizationId: string;
    explore: boolean;
}>) {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const messages: Message[] = yield select(messagesSelector);
    const message = messages.find((message) => message.localId === payload.assistantMessageId);

    if (payload.explore) {
        window.location.href = getVisualizationHref(workspace, payload.savedVisualizationId);
    }

    if (!message?.id) {
        return;
    }

    const chatThread = backend.workspace(workspace).genAI().getChatThread();

    yield call([chatThread, chatThread.saveUserVisualisation], message.id, {
        createdId: payload.visualizationId,
        savedId: payload.savedVisualizationId,
    } as GenAIChatInteractionUserVisualisation);
}
