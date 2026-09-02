// (C) 2024-2026 GoodData Corporation

import { ConversationReasoningContent } from "../messages/conversationContents/ConversationReasoningContent.js";

import { type IGenAIAssistantMessageReasoningContentProps } from "./types.js";

/**
 * Default implementation of the MessageReasoningContent slot.
 *
 * @alpha
 */
export function DefaultMessageReasoningContent(props: IGenAIAssistantMessageReasoningContentProps) {
    return <ConversationReasoningContent {...props} />;
}
