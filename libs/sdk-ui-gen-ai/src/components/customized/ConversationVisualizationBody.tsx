// (C) 2026 GoodData Corporation

import { ConversationVisualisation } from "../messages/conversationContents/ConversationVisualisation.js";

import { type IGenAIAssistantConversationVisualisationProps } from "./types.js";

/**
 * Default implementation of the ConversationVisualizationBody slot.
 *
 * @alpha
 */
export function DefaultConversationVisualizationBody(props: IGenAIAssistantConversationVisualisationProps) {
    return <ConversationVisualisation {...props} />;
}
