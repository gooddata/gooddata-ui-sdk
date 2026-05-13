// (C) 2024-2026 GoodData Corporation

import { type IChatConversation } from "@gooddata/sdk-backend-spi";
import { type SdkErrorType } from "@gooddata/sdk-ui";

import { type TextContentObject } from "../model.js";

/**
 * A common event definition for the Chat component.
 * @public
 */
export type BaseEvent = {
    threadId?: string;
};

/**
 * A chat window opened event.
 * @public
 */
export type ChatOpenedEvent = BaseEvent & {
    type: "chatOpened";
};

/**
 * Type guard for the ChatOpenedEvent.
 * @public
 */
export const isChatOpenedEvent = (event: ChatEvent): event is ChatOpenedEvent => {
    return event.type === "chatOpened";
};

/**
 * A chat window closed event.
 * @public
 */
export type ChatClosedEvent = BaseEvent & {
    type: "chatClosed";
};

/**
 * Type guard for the ChatClosedEvent.
 * @public
 */
export const isChatClosedEvent = (event: ChatEvent): event is ChatClosedEvent => {
    return event.type === "chatClosed";
};

/**
 * A chat conversation clearing event.
 * @public
 */
export type ChatResetEvent = BaseEvent & {
    type: "chatReset";
};

/**
 * Type guard for the ChatResetEvent.
 * @public
 */
export const isChatResetEvent = (event: ChatEvent): event is ChatResetEvent => {
    return event.type === "chatReset";
};

/**
 * A chat conversation pinned state change event.
 * @public
 */
export type ChatConversationPinnedEvent = BaseEvent & {
    type: "chatConversationPinned";
    conversationId: string;
    pinned: boolean;
};

/**
 * Type guard for the ChatConversationPinnedEvent.
 * @public
 */
export const isChatConversationPinnedEvent = (event: ChatEvent): event is ChatConversationPinnedEvent => {
    return event.type === "chatConversationPinned";
};

/**
 * A chat conversation pinned state change error event.
 * @public
 */
export type ChatConversationPinErrorEvent = BaseEvent & {
    type: "chatConversationPinError";
    conversationId: string;
    error: Error;
};

/**
 * Type guard for the ChatConversationPinnedEvent.
 * @public
 */
export const isChatConversationPinErrorEvent = (event: ChatEvent): event is ChatConversationPinErrorEvent => {
    return event.type === "chatConversationPinError";
};

/**
 * A chat conversation deleted event.
 * @public
 */
export type ChatConversationDeletedEvent = BaseEvent & {
    type: "chatConversationDeleted";
    conversation: IChatConversation;
};

/**
 * Type guard for the ChatConversationDeletedEvent.
 * @public
 */
export const isChatConversationDeletedEvent = (event: ChatEvent): event is ChatConversationDeletedEvent => {
    return event.type === "chatConversationDeleted";
};

/**
 * A chat conversation deleted error event.
 * @public
 */
export type ChatConversationDeletedErrorEvent = BaseEvent & {
    type: "chatConversationDeletedError";
    conversation: IChatConversation;
    error: Error;
};

/**
 * Type guard for the ChatConversationDeletedEvent.
 * @public
 */
export const isChatConversationDeletedErrorEvent = (
    event: ChatEvent,
): event is ChatConversationDeletedErrorEvent => {
    return event.type === "chatConversationDeletedError";
};

/**
 * A chat user message event.
 * @public
 */
export type ChatUserMessageEvent = BaseEvent & {
    type: "chatUserMessage";
    question: string;
    objects: TextContentObject[];
};

/**
 * Type guard for the ChatUserMessageEvent.
 * @public
 */
export const isChatUserMessageEvent = (event: ChatEvent): event is ChatUserMessageEvent => {
    return event.type === "chatUserMessage";
};

/**
 * A chat assistant message event.
 * @public
 */
export type ChatAssistantMessageEvent = BaseEvent & {
    type: "chatAssistantMessage";
    interactionId?: string;
    useCase: string;
};

/**
 * Type guard for the ChatAssistantMessageEvent.
 * @public
 */
export const isChatAssistantMessageEvent = (event: ChatEvent): event is ChatAssistantMessageEvent => {
    return event.type === "chatAssistantMessage";
};

/**
 * A chat feedback event.
 * @public
 */
export type ChatFeedbackEvent = BaseEvent & {
    type: "chatFeedback";
    interactionId?: string;
    feedback: "POSITIVE" | "NEGATIVE" | "NONE";
    userTextFeedback?: string;
};

/**
 * Type guard for the ChatFeedbackEvent.
 * @public
 */
export const isChatFeedbackEvent = (event: ChatEvent): event is ChatFeedbackEvent => {
    return event.type === "chatFeedback";
};

/**
 * A chat feedback error event.
 * @public
 */
export type ChatFeedbackErrorEvent = BaseEvent & {
    type: "chatFeedbackError";
    interactionId?: string;
    errorMessage: string;
};

/**
 * Type guard for the ChatFeedbackErrorEvent.
 * @public
 */
export const isChatFeedbackErrorEvent = (event: ChatEvent): event is ChatFeedbackErrorEvent => {
    return event.type === "chatFeedbackError";
};

/**
 * A chat visualization error event.
 * @public
 */
export type ChatVisualizationErrorEvent = BaseEvent & {
    type: "chatVisualizationError";
    errorType: SdkErrorType;
    errorMessage?: string;
};

/**
 * Type guard for the ChatVisualizationErrorEvent.
 * @public
 */
export const isChatVisualizationErrorEvent = (event: ChatEvent): event is ChatVisualizationErrorEvent => {
    return event.type === "chatVisualizationError";
};

/**
 * A chat save visualization error event.
 * @public
 */
export type ChatSaveVisualizationErrorEvent = BaseEvent & {
    type: "chatSaveVisualizationError";
    errorType: string;
    errorMessage?: string;
};

/**
 * Type guard for the ChatVisualizationErrorEvent.
 * @public
 */
export const isChatSaveVisualizationErrorEvent = (
    event: ChatEvent,
): event is ChatSaveVisualizationErrorEvent => {
    return event.type === "chatSaveVisualizationError";
};

/**
 * A chat save visualization success event.
 * @public
 */
export type ChatSaveVisualizationSuccessEvent = BaseEvent & {
    type: "chatSaveVisualizationSuccess";
    savedVisualizationId: string;
};

/**
 * Type guard for the ChatSaveVisualizationSuccessEvent.
 * @public
 */
export const isChatSaveVisualizationSuccessEvent = (
    event: ChatEvent,
): event is ChatSaveVisualizationSuccessEvent => {
    return event.type === "chatSaveVisualizationSuccess";
};

/**
 * A chat copy to clipboard event.
 * @public
 */
export type ChatCopyToClipboardEvent = BaseEvent & {
    type: "chatCopyToClipboard";
    content: string;
};

/**
 * Type guard for the ChatCopyToClipboardEvent.
 * @public
 */
export const isChatCopyToClipboardEvent = (event: ChatEvent): event is ChatCopyToClipboardEvent => {
    return event.type === "chatCopyToClipboard";
};

/**
 * A union type for all chat events.
 * @public
 */
export type ChatEvent =
    | ChatOpenedEvent
    | ChatClosedEvent
    | ChatResetEvent
    | ChatConversationPinnedEvent
    | ChatConversationPinErrorEvent
    | ChatConversationDeletedEvent
    | ChatConversationDeletedErrorEvent
    | ChatUserMessageEvent
    | ChatAssistantMessageEvent
    | ChatFeedbackEvent
    | ChatFeedbackErrorEvent
    | ChatCopyToClipboardEvent
    | ChatVisualizationErrorEvent
    | ChatSaveVisualizationErrorEvent
    | ChatSaveVisualizationSuccessEvent;

/**
 * An event handler for the Chat component.
 * @public
 */
export type ChatEventHandler<TEvent extends ChatEvent = any> = {
    /**
     * A guard for a specific event type.
     */
    eval: (event: ChatEvent) => event is TEvent;
    /**
     * Event handler.
     */
    handler: (event: TEvent) => void;
};

/**
 * A dispatcher for chat events.
 * @internal
 */
export class EventDispatcher {
    private handlers: ChatEventHandler[] = [];

    public setHandlers(handlers: ChatEventHandler[]): void {
        this.handlers = handlers;
    }

    public dispatch(event: ChatEvent): void {
        this.handlers.forEach((handler) => {
            if (handler.eval(event)) {
                handler.handler(event);
            }
        });
    }
}
