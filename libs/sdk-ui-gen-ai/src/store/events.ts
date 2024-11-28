// (C) 2024 GoodData Corporation

/**
 * A common event definition for the Chat component.
 * @alpha
 */
export type BaseEvent = {
    threadId?: string;
};

/**
 * A chat window opened event.
 * @alpha
 */
export type ChatOpenedEvent = BaseEvent & {
    type: "chatOpened";
};

/**
 * Type guard for the ChatOpenedEvent.
 * @alpha
 */
export const isChatOpenedEvent = (event: ChatEvent): event is ChatOpenedEvent => {
    return event.type === "chatOpened";
};

/**
 * A chat window closed event.
 * @alpha
 */
export type ChatClosedEvent = BaseEvent & {
    type: "chatClosed";
};

/**
 * Type guard for the ChatClosedEvent.
 * @alpha
 */
export const isChatClosedEvent = (event: ChatEvent): event is ChatClosedEvent => {
    return event.type === "chatClosed";
};

/**
 * A chat conversation clearing event.
 * @alpha
 */
export type ChatResetEvent = BaseEvent & {
    type: "chatReset";
};

/**
 * Type guard for the ChatResetEvent.
 * @alpha
 */
export const isChatResetEvent = (event: ChatEvent): event is ChatResetEvent => {
    return event.type === "chatReset";
};

/**
 * A chat user message event.
 * @alpha
 */
export type ChatUserMessageEvent = BaseEvent & {
    type: "chatUserMessage";
    question: string;
};

/**
 * Type guard for the ChatUserMessageEvent.
 * @alpha
 */
export const isChatUserMessageEvent = (event: ChatEvent): event is ChatUserMessageEvent => {
    return event.type === "chatUserMessage";
};

/**
 * A chat assistant message event.
 * @alpha
 */
export type ChatAssistantMessageEvent = BaseEvent & {
    type: "chatAssistantMessage";
    interactionId?: number;
    useCase: string;
};

/**
 * Type guard for the ChatAssistantMessageEvent.
 * @alpha
 */
export const isChatAssistantMessageEvent = (event: ChatEvent): event is ChatAssistantMessageEvent => {
    return event.type === "chatAssistantMessage";
};

/**
 * A chat feedback event.
 * @alpha
 */
export type ChatFeedbackEvent = BaseEvent & {
    type: "chatFeedback";
    interactionId?: number;
    feedback: "POSITIVE" | "NEGATIVE" | "NONE";
};

/**
 * Type guard for the ChatFeedbackEvent.
 * @alpha
 */
export const isChatFeedbackEvent = (event: ChatEvent): event is ChatFeedbackEvent => {
    return event.type === "chatFeedback";
};

/**
 * A union type for all chat events.
 * @alpha
 */
export type ChatEvent =
    | ChatOpenedEvent
    | ChatClosedEvent
    | ChatResetEvent
    | ChatUserMessageEvent
    | ChatAssistantMessageEvent
    | ChatFeedbackEvent;

/**
 * An event handler for the Chat component.
 * @alpha
 */
export interface ChatEventHandler<TEvent extends ChatEvent = any> {
    /**
     * A guard for a specific event type.
     */
    eval: (event: ChatEvent) => event is TEvent;
    /**
     * Event handler.
     */
    handler: (event: TEvent) => void;
}

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
