// (C) 2024-2026 GoodData Corporation

import { ConversationErrorContent } from "../messages/conversationContents/ConversationErrorContent.js";

import { type IGenAIAssistantMessageErrorContentProps } from "./types.js";

/**
 * Default implementation of the MessageErrorContent slot.
 *
 * @alpha
 */
export function DefaultMessageErrorContent(props: IGenAIAssistantMessageErrorContentProps) {
    return <ConversationErrorContent {...props} />;
}
