// (C) 2024-2026 GoodData Corporation

import {
    type IChatConversation,
    type IChatConversationItemsQuery,
    type IChatConversationThread,
    type IChatConversations,
} from "@gooddata/sdk-backend-spi";

/**
 * Dummy chat conversations interface for testing.
 * @internal
 */
export class DummyChatConversations implements IChatConversations {
    getConversationItemsQuery(): IChatConversationItemsQuery {
        throw new Error("Method not implemented.");
    }
    create(): Promise<IChatConversation> {
        throw new Error("Method not implemented.");
    }
    update(_conversationId: string, _conversation: IChatConversation): Promise<IChatConversation> {
        throw new Error("Method not implemented.");
    }
    switchAgent(_conversationId: string, _agentId: string): Promise<IChatConversation> {
        throw new Error("Method not implemented.");
    }
    delete(_conversationId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    generateTitle(_conversationId: string): Promise<IChatConversation> {
        throw new Error("Method not implemented.");
    }
    getConversation(_conversationId: string): Promise<IChatConversation> {
        throw new Error("Method not implemented.");
    }
    getConversationThread(_conversationId: string): IChatConversationThread {
        throw new Error("Method not implemented.");
    }
}
