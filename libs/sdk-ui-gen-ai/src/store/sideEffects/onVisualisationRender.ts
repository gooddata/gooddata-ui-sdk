// (C) 2024-2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";
import { extractError } from "./utils.js";
import { messagesSelector } from "../messages/messagesSelectors.js";
import { isVisualizationContents, Message } from "../../model.js";
import { saveVisualisationRenderStatusSuccessAction } from "../messages/messagesSlice.js";

/**
 * Visualisation render status to server.
 * Optimistic update, ignoring the error.
 * @internal
 */
export function* onVisualisationRender({
    payload,
}: PayloadAction<{
    visualizationId: string;
    assistantMessageId: string;
    status: "SUCCESSFUL" | "UNEXPECTED_ERROR" | "TOO_MANY_DATA_POINTS" | "NO_DATA" | "NO_RESULTS";
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

        const visualization = message.content
            .filter(isVisualizationContents)
            .flatMap((content) => content.createdVisualizations)
            .find((content) => content.id === payload.visualizationId);

        // Already reported
        if (!visualization?.statusReportPending) {
            return;
        }

        const chatThread = backend.workspace(workspace).genAI().getChatThread();

        yield call([chatThread, chatThread.saveRenderVisualisationStatus], message.id, payload.status);

        yield put(saveVisualisationRenderStatusSuccessAction(payload));
    } catch (e) {
        console.warn(`Failed to save visualisation render status: ${extractError(e)}`);
    }
}
