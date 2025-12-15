// (C) 2024-2025 GoodData Corporation

/**
 * This package provides React components for GoodData's GenAI features.
 * @packageDocumentation
 * @beta
 */

export {
    GenAIChat,
    GenAIAssistant,
    type GenAIChatProps,
    type GenAIAssistantProps,
} from "./components/GenAIChat.js";
export {
    makeUserMessage,
    makeTextContents,
    type Message,
    type BaseMessage,
    type UserMessage,
    type AssistantMessage,
    type Contents,
    type TextContents,
    type SearchContents,
    type SemanticSearchContents,
    type RoutingContents,
    type ReasoningContents,
    type ReasoningStep,
    type ReasoningThought,
    type VisualizationContents,
    type ChangeAnalysisContents,
    type ErrorContents,
    type TextContentObject,
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
    type ChatFeedbackErrorEvent,
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
    isChatFeedbackErrorEvent,
    isChatVisualizationErrorEvent,
    isChatSaveVisualizationErrorEvent,
    isChatSaveVisualizationSuccessEvent,
    isChatCopyToClipboardEvent,
} from "./store/events.js";

export { clearThreadAction, newMessageAction } from "./store/index.js";
export { type LinkHandlerEvent } from "./components/ConfigContext.js";
export { useGenAiChatAvailability } from "./hooks/useGenAiChatAvailability.js";

//customization

export { DefaultLandingScreen, type LandingScreenProps } from "./components/customized/LandingScreen.js";
export {
    DefaultLandingTitle,
    DefaultLandingTitleAscent,
    type LandingTitleProps,
} from "./components/customized/LandingTitle.js";
export {
    DefaultLandingQuestion,
    type LandingQuestionProps,
} from "./components/customized/LandingQuestion.js";
