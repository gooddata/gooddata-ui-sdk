// (C) 2024-2025 GoodData Corporation

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
    type ChatVisualizationErrorEvent,
    type ChatSaveVisualizationErrorEvent,
    type ChatSaveVisualizationSuccessEvent,
    type ChatCopyToClipboardEvent,
    isChatAssistantMessageEvent,
    isChatUserMessageEvent,
    isChatClosedEvent,
    isChatOpenedEvent,
    isChatResetEvent,
    isChatFeedbackEvent,
    isChatVisualizationErrorEvent,
    isChatSaveVisualizationErrorEvent,
    isChatSaveVisualizationSuccessEvent,
    isChatCopyToClipboardEvent,
} from "./store/events.js";

export type { LinkHandlerEvent } from "./components/ConfigContext.js";
