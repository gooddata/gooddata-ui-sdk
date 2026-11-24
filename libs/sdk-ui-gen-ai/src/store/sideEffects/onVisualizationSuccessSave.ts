// (C) 2025-2026 GoodData Corporation

import { getContext, select } from "redux-saga/effects";

import { type IChatConversationLocal } from "../../model.js";
import { getVisualizationHref } from "../../utils.js";
import { conversationByIdOrLocalIdSelector } from "../messages/messagesSelectors.js";
import { type saveVisualizationSuccessAction } from "../messages/messagesSlice.js";
import { type OptionsDispatcher } from "../options.js";

export function* onVisualizationSuccessSave({ payload }: ReturnType<typeof saveVisualizationSuccessAction>) {
    // Retrieve backend from context
    const workspace: string = yield getContext("workspace");
    const options: OptionsDispatcher = yield getContext("optionsDispatcher");
    const conversation: IChatConversationLocal | undefined = payload.conversationId
        ? yield select(conversationByIdOrLocalIdSelector, payload.conversationId)
        : undefined;

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
                preventDefault: () => {},
                itemUrl: getVisualizationHref(workspace, payload.savedVisualizationId, visualizationStatus),
                visualizationStatus,
                action: "open",
                conversationId: conversation.localId,
            });
        }
    }
}
