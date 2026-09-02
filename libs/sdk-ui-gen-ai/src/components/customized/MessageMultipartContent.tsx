// (C) 2024-2026 GoodData Corporation

import { ConversationMultipartContent } from "../messages/conversationContents/ConversationMultipartContent.js";

import { type IGenAIAssistantMessageMultipartContentProps } from "./types.js";

/**
 * Default implementation of the MessageMultipartContent slot.
 *
 * @alpha
 */
export function DefaultMessageMultipartContent(props: IGenAIAssistantMessageMultipartContentProps) {
    return <ConversationMultipartContent {...props} />;
}
