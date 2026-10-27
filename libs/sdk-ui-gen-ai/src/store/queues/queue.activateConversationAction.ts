// (C) 2026 GoodData Corporation

import { type Middleware, type UnknownAction } from "@reduxjs/toolkit";

import {
    activateConversationAction,
    clearConversationSuccessAction,
    loadConversationsSuccessAction,
    setCurrentConversationAction,
    startNewConversationAction,
} from "../messages/messagesSlice.js";
import { type RootState } from "../types.js";

export const queueActivateConversationMiddleware: Middleware = (storeAPI) => {
    let queuedAction: ReturnType<typeof activateConversationAction> | undefined;

    return (next) => (action) => {
        const actionType = (action as UnknownAction).type;

        if (
            actionType === setCurrentConversationAction.type ||
            actionType === startNewConversationAction.type ||
            actionType === clearConversationSuccessAction.type
        ) {
            queuedAction = undefined;
        }

        if (actionType === activateConversationAction.type) {
            const state = storeAPI.getState() as RootState;
            const { conversationId } = (action as ReturnType<typeof activateConversationAction>).payload;
            const conversations = [
                state.messages.currentConversation,
                ...(state.messages.conversations ?? []),
            ];
            const conversationIsAvailable = conversations.some(
                (conversation) =>
                    conversation?.id === conversationId || conversation?.localId === conversationId,
            );

            if (!state.messages.conversationsLoaded && !conversationIsAvailable) {
                queuedAction = action as ReturnType<typeof activateConversationAction>;
                return undefined;
            }
        }

        const result = next(action);

        if (actionType === loadConversationsSuccessAction.type && queuedAction) {
            const state = storeAPI.getState() as RootState;
            if (state.messages.conversationsLoaded) {
                const actionToReplay = queuedAction;
                queuedAction = undefined;
                storeAPI.dispatch(actionToReplay);
            }
        }

        return result;
    };
};
