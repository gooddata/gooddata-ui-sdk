// (C) 2025-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import noop from "lodash-es/noop.js";
import { getContext, select } from "redux-saga/effects";

import { type IChatConversationLocal } from "../../model.js";
import { getVisualizationHref } from "../../utils.js";
import { conversationSelector } from "../messages/messagesSelectors.js";
import { type OptionsDispatcher } from "../options.js";

export function* onVisualizationSuccessSave({
    payload,
}: PayloadAction<{
    visualizationId: string;
    assistantMessageId: string;
    savedVisualizationId: string;
    explore: boolean;
}>) {
    // Retrieve backend from context
    const workspace: string = yield getContext("workspace");
    const options: OptionsDispatcher = yield getContext("optionsDispatcher");
    const conversation: IChatConversationLocal = yield select(conversationSelector);

    const { onLinkClick, allowNativeLinks } = options.getOnLinkClick();
    const visualizationStatus = "saved";

    if (conversation && payload.explore) {
        if (allowNativeLinks) {
            window.location.href = getVisualizationHref(
                workspace,
                payload.savedVisualizationId,
                visualizationStatus,
            );
        } else {
            onLinkClick?.({
                id: payload.savedVisualizationId,
                type: "visualization",
                workspaceId: workspace,
                newTab: true,
                preventDefault: noop,
                itemUrl: getVisualizationHref(workspace, payload.savedVisualizationId, visualizationStatus),
                visualizationStatus,
                action: "open",
                conversationId: conversation.localId,
            });
        }
    }
}
