// (C) 2024-2026 GoodData Corporation

import { put } from "redux-saga/effects";

import {
    type IChatConversationContent,
    type IChatConversationMultipartPart,
    isChatConversationDashboardContent,
    isChatConversationMultipartContent,
    isChatConversationVisualisationContent,
} from "@gooddata/sdk-backend-spi";

import {
    type IChatConversationLocalItem,
    type Message,
    isAssistantMessage,
    isChatConversationLocalItem,
} from "../../model.js";
import { onDefinitionReceivedAction } from "../chatWindow/chatWindowSlice.js";

/**
 * Notify the store that a definition was received.
 * @internal
 */
export function* notifyDefinitionReceived(
    items: IChatConversationLocalItem | Message | (IChatConversationLocalItem | Message)[],
    conversationId: string,
) {
    const itemsArray = Array.isArray(items) ? items : [items];

    function* processContent(
        item: IChatConversationLocalItem,
        content: IChatConversationMultipartPart | IChatConversationContent,
        interactionId: string,
    ): Generator {
        const multipartContent = content as IChatConversationMultipartPart;
        const normalContent = content as IChatConversationContent;

        if (isChatConversationMultipartContent(normalContent)) {
            for (const part of normalContent.parts) {
                yield* processContent(item, part, interactionId);
            }
        } else if (isChatConversationDashboardContent(multipartContent) && multipartContent.dashboard) {
            yield put(
                onDefinitionReceivedAction({
                    conversationId,
                    interactionId,
                    itemId: item.id,
                    definitionType: "dashboard",
                    dashboard: multipartContent.dashboard,
                }),
            );
        } else if (
            isChatConversationVisualisationContent(multipartContent) &&
            multipartContent.visualization
        ) {
            yield put(
                onDefinitionReceivedAction({
                    conversationId,
                    interactionId,
                    itemId: item.id,
                    definitionType: "visualization",
                    visualization: multipartContent.visualization,
                }),
            );
        }
    }

    for (const item of itemsArray) {
        if (isChatConversationLocalItem(item)) {
            const interactionId = item.responseId;
            yield* processContent(
                item,
                item.content as IChatConversationMultipartPart | IChatConversationContent,
                interactionId,
            );
        } else if (isAssistantMessage(item)) {
            //NOTE: This is not supported for old messages api
        }
    }
}
