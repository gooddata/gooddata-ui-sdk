// (C) 2024-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { put } from "redux-saga/effects";

import { saveVisualisationRenderStatusSuccessAction } from "../messages/messagesSlice.js";

import { extractError } from "./utils.js";

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
        yield put(saveVisualisationRenderStatusSuccessAction(payload));
    } catch (e) {
        console.warn(`Failed to save visualisation render status: ${extractError(e)}`);
    }
}
