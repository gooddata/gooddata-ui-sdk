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
export {
    type ChatEventHandler,
    type BaseEvent,
    type ChatAssistantMessageEvent,
    type ChatUserMessageEvent,
    type ChatClosedEvent,
    type ChatOpenedEvent,
    type ChatResetEvent,
    type ChatFeedbackEvent,
    type ChatEvent,
    isChatAssistantMessageEvent,
    isChatUserMessageEvent,
    isChatClosedEvent,
    isChatOpenedEvent,
    isChatResetEvent,
    isChatFeedbackEvent,
} from "./store/events.js";
