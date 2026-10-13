// (C) 2026 GoodData Corporation

import { ConversationKdaContent } from "../messages/conversationContents/ConversationKdaContent.js";

import { type IGenAIAssistantConversationKdaContentProps } from "./types.js";

/**
 * Default implementation of the ConversationKdaContent slot.
 *
 * @alpha
 */
export function DefaultConversationKdaContent(props: IGenAIAssistantConversationKdaContentProps) {
    return <ConversationKdaContent {...props} />;
}
