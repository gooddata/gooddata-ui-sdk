// (C) 2024 GoodData Corporation

/**
 * This package provides React components for GoodData's GenAI features.
 * @packageDocumentation
 * @beta
 */

export type { GenAIChatProps } from "./components/GenAIChat.js";
export { GenAIChat } from "./components/GenAIChat.js";
export type {
    Message,
    BaseMessage,
    UserMessage,
    UserTextMessage,
    AssistantMessage,
    AssistantTextMessage,
    AssistantErrorMessage,
    AssistantCancelledMessage,
    AssistantSearchCreateMessage,
    SystemMessage,
    SystemTextMessage,
} from "./model.js";
