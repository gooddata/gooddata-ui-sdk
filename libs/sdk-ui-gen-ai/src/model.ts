// (C) 2024-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import {
    type IChatConversation,
    type IChatConversationContent,
    type IChatConversationError,
    type IChatConversationItem,
    type IChatConversationMultipartPart,
    type IChatSuggestions,
    isChatConversationItem,
} from "@gooddata/sdk-backend-spi";

/**
 * @public
 * Describes an AI assistant agent.
 */
export type GenAIAgent = {
    /**
     * Unique identifier of the agent.
     */
    id: string;
    /**
     * Title of the agent.
     */
    title: string;
    /**
     * Description of the agent.
     */
    description?: string;
    /**
     * The date and time when the agent was last modified.
     */
    modifiedAt?: string;
    /**
     * The date and time when the agent was last used.
     */
    lastUsedAt?: string;
};

/**
 * @public
 */
export type TextContentObject = {
    id: string;
    type: "metric" | "attribute" | "fact" | "date" | "label" | "dashboard" | "visualization" | "dataset";
    title: string;
};

/**
 * Represents a local chat conversation that extends the base `IChatConversation` type.
 * Includes additional optional properties specific to the local context.
 * @public
 */
export type IChatConversationLocal = IChatConversation & {
    localId: string;
    generatingTitle?: boolean;
    inProgress?: boolean;
};

/**
 * Chat conversation item with local ID.
 * @public
 */
export type IChatConversationLocalItem = Omit<IChatConversationItem, "content"> & {
    //states
    cancelled?: boolean;
    complete?: boolean;
    streaming?: boolean;
    filled?: boolean;
    //data
    localId: string;
    content: IChatConversationLocalContent | IChatConversationErrorContent | IChatConversationSystemContent;
};

/**
 * Type guard for the IChatConversationLocalItem.
 * @internal
 */
export function isChatConversationLocalItem(obj: any): obj is IChatConversationLocalItem {
    return isChatConversationItem(obj);
}

/**
 * Chat local conversation content
 * @public
 */
export type IChatConversationLocalContent = IChatConversationContent & {
    objects?: TextContentObject[];
    parts?: IChatConversationMultipartPart[];
};

/**
 * Chat conversation error content
 * @public
 */
export type IChatConversationErrorContent = {
    type: "error";
    message: string;
    code?: number;
    reason?: IChatConversationError["reason"];
    traceId?: string;
};

/**
 * Local-only content type for system-role items (e.g. agent-switch events).
 * Meaningful data lives in top-level item fields; content is structurally required but unused.
 * @public
 */
export type IChatConversationSystemContent = {
    type: "system";
};

/**
 * Chat local conversation multipart local part
 * @public
 */
export type IChatConversationMultipartLocalPart = IChatConversationMultipartPart & {
    reporting?: boolean;
    saving?: {
        started: boolean;
        completed: boolean;
    };
    error?: {
        name: string;
        message: string;
    };
    objects?: TextContentObject[];
    suggestions?: IChatSuggestions;
};

/**
 * Make a new conversation item with local ID.
 * @internal
 */
export const makeConversationItem = (item: IChatConversationItem): IChatConversationLocalItem => ({
    ...item,
    localId: uuidv4(),
    complete: true,
    filled: true,
});

/**
 * Make a new assistant message item.
 * @internal
 */
export const makeAssistantItem = (
    content?: IChatConversationLocalContent,
    id?: string,
    complete?: boolean,
): IChatConversationLocalItem => ({
    complete,
    id: id ?? "",
    type: "item",
    localId: uuidv4(),
    responseId: "",
    createdAt: Date.now(),
    role: "assistant",
    content: content ?? {
        type: "reasoning",
        summary: "",
    },
});

/**
 * Make a new user message item.
 * @internal
 */
export const makeUserItem = (
    content?: IChatConversationLocalContent,
    id?: string,
): IChatConversationLocalItem => ({
    id: id ?? "",
    type: "item",
    localId: uuidv4(),
    responseId: "",
    complete: true,
    createdAt: Date.now(),
    role: "user",
    content: content ?? {
        type: "text",
        text: "",
    },
});

/**
 * Make an optimistic agent change event item for the current session.
 * @internal
 */
export const makeAgentChangeItem = ({
    agentId,
    oldAgentId,
}: {
    agentId: string;
    oldAgentId?: string;
}): IChatConversationLocalItem => ({
    id: "",
    type: "item",
    localId: uuidv4(),
    responseId: "",
    complete: true,
    createdAt: Date.now(),
    role: "system",
    agentId,
    oldAgentId,
    content: { type: "system" },
});

/**
 * Make a new error message item.
 */
export const makeErrorContent = (message: string, code?: number): IChatConversationErrorContent => ({
    type: "error",
    message,
    code,
});
