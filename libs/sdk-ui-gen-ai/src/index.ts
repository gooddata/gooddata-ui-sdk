// (C) 2024-2025 GoodData Corporation

/**
 * This package provides React components for GoodData's GenAI features.
 * @packageDocumentation
 * @beta
 */

export type { GenAIChatProps, GenAIAssistantProps } from "./components/GenAIChat.js";
export { GenAIChat, GenAIAssistant } from "./components/GenAIChat.js";
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
    ChangeAnalysisContents,
    ErrorContents,
    TextContentObject,
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
export { makeUserMessage, makeTextContents } from "./model.js";
export type { LinkHandlerEvent } from "./components/ConfigContext.js";

//customization

export type { LandingScreenProps } from "./components/customized/LandingScreen.js";
export { DefaultLandingScreen } from "./components/customized/LandingScreen.js";
export type { LandingTitleProps } from "./components/customized/LandingTitle.js";
export { DefaultLandingTitle, DefaultLandingTitleAscent } from "./components/customized/LandingTitle.js";
export type { LandingQuestionProps } from "./components/customized/LandingQuestion.js";
export { DefaultLandingQuestion } from "./components/customized/LandingQuestion.js";
