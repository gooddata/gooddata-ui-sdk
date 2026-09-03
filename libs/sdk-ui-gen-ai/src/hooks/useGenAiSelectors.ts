// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { type IChatConversationLocal } from "../model.js";
import {
    conversationSelector,
    conversationsLoadedSelector,
    conversationsSelector,
} from "../store/messages/messagesSelectors.js";

/**
 * Hook to retrieve the list of all conversations.
 *
 * @alpha
 */
export function useGenAiConversations(): IChatConversationLocal[] | undefined {
    return useSelector(conversationsSelector);
}

/**
 * Hook to retrieve the current active conversation.
 *
 * @alpha
 */
export function useGenAiCurrentConversation(): IChatConversationLocal | undefined {
    return useSelector(conversationSelector);
}

/**
 * Hook to retrieve whether the conversations have been loaded.
 *
 * @alpha
 */
export function useGenAiConversationsLoaded(): boolean {
    return useSelector(conversationsLoadedSelector);
}
