// (C) 2024-2026 GoodData Corporation

import { ConversationVisualizationContent } from "../messages/conversationContents/ConversationVisualizationContent.js";

import { type IGenAIAssistantConversationVisualizationContentProps } from "./types.js";

/**
 * Default implementation of the ConversationVisualizationContent slot.
 *
 * @alpha
 */
export function DefaultConversationVisualizationContent(
    props: IGenAIAssistantConversationVisualizationContentProps,
) {
    return <ConversationVisualizationContent {...props} />;
}
