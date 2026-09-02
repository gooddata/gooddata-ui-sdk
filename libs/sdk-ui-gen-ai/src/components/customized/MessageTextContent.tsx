// (C) 2024-2026 GoodData Corporation

import { ConversationTextContent } from "../messages/conversationContents/ConversationTextContent.js";

import { type IGenAIAssistantMessageTextContentProps } from "./types.js";

/**
 * Default implementation of the MessageTextContent slot.
 *
 * @alpha
 */
export function DefaultMessageTextContent(props: IGenAIAssistantMessageTextContentProps) {
    return <ConversationTextContent {...props} />;
}
