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
    AssistantMessage,
    Contents,
    TextContents,
    SearchContents,
    RoutingContents,
    VisualizationContents,
    ErrorContents,
} from "./model.js";
