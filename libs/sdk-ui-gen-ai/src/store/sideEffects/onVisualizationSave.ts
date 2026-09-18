// (C) 2024-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsight } from "@gooddata/sdk-model";

import {
    type IChatConversationLocal,
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
} from "../../model.js";
import { conversationMessagesSelector, conversationSelector } from "../messages/messagesSelectors.js";
import { saveVisualizationErrorAction, saveVisualizationSuccessAction } from "../messages/messagesSlice.js";

export function* onVisualizationSave({
    payload,
}: PayloadAction<{
    visualizationId: string;
    visualizationTitle: string;
    assistantMessageId: string;
    explore: boolean;
}>) {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const conversation: IChatConversationLocal = yield select(conversationSelector);

    try {
        const messages: IChatConversationLocalItem[] = yield select(conversationMessagesSelector);
        const assistantMessage = messages.find((message) => message.localId === payload.assistantMessageId);

        if (assistantMessage?.content.type !== "multipart") {
            return;
        }

        const visualizationContent: IChatConversationMultipartLocalPart | undefined =
            assistantMessage.content.parts
                .filter((filter) => filter.type === "visualization")
                .find((content) => content.visualization?.insight.identifier === payload.visualizationId);

        if (!visualizationContent?.visualization) {
            return;
        }
        const sourceVisualization = visualizationContent.visualization;
        const insightsService = backend.workspace(workspace).insights();

        const savedVisualization: IInsight = yield call(insightsService.createInsight.bind(insightsService), {
            ...sourceVisualization,
            insight: {
                ...sourceVisualization.insight,
                title: payload.visualizationTitle,
            },
        });

        const resave = backend
            .workspace(workspace)
            .genAI()
            .getChatConversations()
            .getConversationThread(conversation.id);
        yield call(
            resave.resaveVisualisation.bind(resave),
            sourceVisualization.insight.identifier,
            savedVisualization.insight.identifier,
        );

        yield put(
            saveVisualizationSuccessAction({
                visualizationId: payload.visualizationId,
                assistantMessageId: payload.assistantMessageId,
                savedVisualizationId: savedVisualization.insight.identifier,
                explore: payload.explore,
                conversationId: conversation.localId,
            }),
        );
    } catch (e) {
        console.error(e);

        const error = e as Error;
        yield put(
            saveVisualizationErrorAction({
                error: {
                    name: error.name,
                    message: error.message,
                },
                visualizationId: payload.visualizationId,
                assistantMessageId: payload.assistantMessageId,
                conversationId: conversation?.localId,
            }),
        );
    }
}
