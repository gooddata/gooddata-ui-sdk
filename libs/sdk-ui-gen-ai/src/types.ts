// (C) 2022-2026 GoodData Corporation

import { type IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import { type IGenAIUserContext, type IGenAIVisualization } from "@gooddata/sdk-model";

import { type IChatConversationLocalItem } from "./model.js";

export type Config =
    | IGenAIVisualization["config"]
    | NonNullable<
          IChatConversationVisualisationContent["visualization"]
      >["insight"]["properties"]["controls"];

export type StoredConversation = {
    /**
     * A record containing chat conversation items indexed by string keys.
     *
     * Each key in the record corresponds to a unique identifier for a chat conversation item.
     * The value associated with each key is an object implementing the IChatConversationLocalItem interface.
     *
     * This structure is used to store and manage local chat conversation data in a key-value format.
     */
    items: Record<string, IChatConversationLocalItem>;
    /**
     * Represents an array of strings that specifies the order of elements or items.
     * Typically used to define a sequence or arrangement.
     */
    order: string[];
    /**
     * If the interface is busy, this specifies the details of the async operation.
     * Where:
     * - loading: the thread history is being loaded from the backend (no messages to show yet)
     * - restoring: cached messages have been restored while the backend fetch is still in-flight
     * - clearing: the thread is being cleared
     * - evaluating: the new user message is being evaluated by assistant
     */
    asyncProcess?: "loading" | "restoring" | "clearing" | "evaluating";
    /**
     * An agent switch selected by the user that has not yet been sent to the backend.
     * It is flushed (switchAgent API + optimistic item) just before the next message is sent.
     */
    pendingAgentSwitch?: {
        agentId: string;
        previousAgentId: string | undefined;
    };
};

export type StoreContext = {
    /**
     * One-shot user context for the next message (e.g. active visualization).
     * Cleared after being consumed by the saga.
     */
    user?: IGenAIUserContext;
    /**
     * Ambient user context kept in sync by the host (e.g. the open dashboard and its
     * live filter state). Unlike the one-shot userContext it persists across messages
     * and is attached to every message that has no one-shot context.
     */
    ambient?: IGenAIUserContext;
    /**
     * Ambient mode for the chat.
     * "suppressed" - ambient context is not used, but automatically change to auto if id is changed
     * "enabled" - ambient context is used if available and updated in real-time
     */
    ambientMode?: "suppressed" | "enabled";
};
