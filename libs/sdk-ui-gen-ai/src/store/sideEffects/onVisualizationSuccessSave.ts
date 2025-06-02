// (C) 2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { getContext } from "redux-saga/effects";

import { getVisualizationHref } from "../../utils.js";

export function* onVisualizationSuccessSave({
    payload,
}: PayloadAction<{
    visualizationId: string;
    assistantMessageId: string;
    savedVisualizationId: string;
    explore: boolean;
}>) {
    const workspaceId: string = yield getContext("workspace");

    if (payload.explore) {
        window.location.href = getVisualizationHref(workspaceId, payload.savedVisualizationId);
    }
}
