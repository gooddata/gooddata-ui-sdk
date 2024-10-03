// (C) 2024 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { GenAIChatFoundObjects, IGenAIChatEvaluation } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export type BaseMessage = {
    id: string;
    created: number;
};

/**
 * @alpha
 */
export type UserMessage = UserTextMessage;

/**
 * @alpha
 */
export type UserTextMessage = BaseMessage & {
    type: "user-text";
    content: {
        text: string;
        cancelled: boolean;
    };
};

/**
 * @alpha
 */
export const isUserTextMessage = (message?: Message): message is UserTextMessage =>
    message?.type === "user-text";

/**
 * @alpha
 */
export const makeUserTextMessage = (text: string): UserTextMessage => ({
    id: uuidv4(),
    type: "user-text",
    created: Date.now(),
    content: {
        text,
        cancelled: false,
    },
});

/**
 * @alpha
 */
export type SystemMessage = SystemTextMessage;

/**
 * @alpha
 */
export type SystemTextMessage = BaseMessage & {
    type: "system-text";
    content: {
        text: string;
    };
};

/**
 * @alpha
 */
export const isSystemTextMessage = (message?: Message): message is SystemMessage =>
    message?.type === "system-text";

/**
 * @alpha
 */
export const makeSystemTextMessage = (text: string): SystemMessage => ({
    id: uuidv4(),
    type: "system-text",
    created: Date.now(),
    content: {
        text,
    },
});

/**
 * @alpha
 */
export type AssistantTextMessage = BaseMessage & {
    type: "assistant-text";
    content: {
        text: string;
    };
};

/**
 * @alpha
 */
export const isAssistantTextMessage = (message?: Message): message is AssistantTextMessage =>
    message?.type === "assistant-text";

/**
 * @alpha
 */
export const makeAssistantTextMessage = (text: string): AssistantTextMessage => ({
    id: uuidv4(),
    type: "assistant-text",
    created: Date.now(),
    content: {
        text,
    },
});

/**
 * @alpha
 */
export type AssistantErrorMessage = BaseMessage & {
    type: "assistant-error";
    content: {
        error: string | null;
        foundObjects?: GenAIChatFoundObjects;
    };
};

/**
 * @alpha
 */
export const isAssistantErrorMessage = (message?: Message): message is AssistantErrorMessage =>
    message?.type === "assistant-error";

/**
 * @alpha
 */
export const makeAssistantErrorMessage = (
    error: string | null,
    foundObjects?: GenAIChatFoundObjects,
): AssistantErrorMessage => ({
    id: uuidv4(),
    type: "assistant-error",
    created: Date.now(),
    content: {
        foundObjects,
        error,
    },
});

/**
 * @alpha
 */
export type AssistantSearchCreateMessage = BaseMessage & {
    type: "assistant-search-create";
    content: IGenAIChatEvaluation;
};

/**
 * @alpha
 */
export const isAssistantSearchCreateMessage = (message?: Message): message is AssistantSearchCreateMessage =>
    message?.type === "assistant-search-create";

/**
 * @alpha
 */
export const makeAssistantSearchCreateMessage = (
    chatEvaluation: IGenAIChatEvaluation,
): AssistantSearchCreateMessage => ({
    id: uuidv4(),
    type: "assistant-search-create",
    created: Date.now(),
    content: chatEvaluation,
});

/**
 * @alpha
 */
export type AssistantCancelledMessage = BaseMessage & {
    type: "assistant-cancelled";
};

/**
 * @alpha
 */
export const isAssistantCancelledMessage = (message?: Message): message is AssistantCancelledMessage =>
    message?.type === "assistant-cancelled";

/**
 * @alpha
 */
export const makeAssistantCancelledMessage = (): AssistantCancelledMessage => ({
    id: uuidv4(),
    type: "assistant-cancelled",
    created: Date.now(),
});

/**
 * @alpha
 */
export type AssistantMessage =
    | AssistantTextMessage
    | AssistantErrorMessage
    | AssistantSearchCreateMessage
    | AssistantCancelledMessage;

/**
 * All messages that can be stored in history.
 * @alpha
 */
export type Message = UserMessage | SystemMessage | AssistantMessage;

/**
 * Only messages that can be displayed in the chat, including in verbose mode.
 * @alpha
 */
export type VisibleMessage = UserMessage | SystemMessage | AssistantMessage;
