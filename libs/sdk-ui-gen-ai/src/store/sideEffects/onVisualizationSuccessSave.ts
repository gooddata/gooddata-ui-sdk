// (C) 2025-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, select } from "redux-saga/effects";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type GenAIChatInteractionUserVisualisation } from "@gooddata/sdk-model";

import { type IChatConversationLocal, type Message } from "../../model.js";
import { getVisualizationHref } from "../../utils.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { conversationSelector, messagesSelector } from "../messages/messagesSelectors.js";

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
    const conversation: IChatConversationLocal = yield select(conversationSelector);
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
    const useHostedAnalyticalDesigner = Boolean(settings?.enableShellApplication_analyticalDesigner);

    if (conversation) {
        if (payload.explore) {
            window.location.href = getVisualizationHref(
                workspace,
                payload.savedVisualizationId,
                useHostedAnalyticalDesigner,
            );
        }

        //NOTE: In new conversations, save call is already done before
    } else {
        const messages: Message[] = yield select(messagesSelector);
        const message = messages.find((message) => message.localId === payload.assistantMessageId);

        if (payload.explore) {
            window.location.href = getVisualizationHref(
                workspace,
                payload.savedVisualizationId,
                useHostedAnalyticalDesigner,
            );
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
}
