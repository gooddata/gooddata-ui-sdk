// (C) 2024 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { IGenAIChatEvaluation } from "@gooddata/sdk-model";

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
export type UserMessage = BaseMessage & {
    role: "user";
    type: "text";
    content: string;
};

export const isUserMessage = (message: Message): message is UserMessage => message && message.role === "user";

export const makeUserMessage = (content: string): UserMessage => ({
    id: uuidv4(),
    role: "user",
    type: "text",
    created: Date.now(),
    content,
});

/**
 * @alpha
 */
export type SystemMessage = BaseMessage & {
    role: "system";
    type: "text";
    content: string;
};

export const isSystemMessage = (message: Message): message is SystemMessage =>
    message && message.role === "system";

export const makeSystemMessage = (content: string): SystemMessage => ({
    id: uuidv4(),
    role: "system",
    type: "text",
    created: Date.now(),
    content,
});

/**
 * @alpha
 */
export type AssistantTextMessage = BaseMessage & {
    role: "assistant";
    type: "text";
    content: string;
};

export const isAssistantTextMessage = (message: Message): message is AssistantTextMessage =>
    message && message.role === "assistant" && message.type === "text";

export const makeAssistantTextMessage = (content: string): AssistantTextMessage => ({
    id: uuidv4(),
    role: "assistant",
    type: "text",
    created: Date.now(),
    content,
});

/**
 * @alpha
 */
export type AssistantErrorMessage = BaseMessage & {
    role: "assistant";
    type: "error";
    content: string;
};

export const isAssistantErrorMessage = (message: Message): message is AssistantErrorMessage =>
    message && message.role === "assistant" && message.type === "error";

export const makeAssistantErrorMessage = (error: string): AssistantErrorMessage => ({
    id: uuidv4(),
    role: "assistant",
    type: "error",
    created: Date.now(),
    content: error,
});

/**
 * @alpha
 */
export type AssistantSearchCreateMessage = BaseMessage & {
    role: "assistant";
    type: "search-create";
    content: IGenAIChatEvaluation;
};

export const isAssistantSearchCreateMessage = (message: Message): message is AssistantSearchCreateMessage =>
    message && message.role === "assistant" && message.type === "search-create";

export const makeAssistantSearchCreateMessage = (
    chatEvaluation: IGenAIChatEvaluation,
): AssistantSearchCreateMessage => ({
    id: uuidv4(),
    role: "assistant",
    type: "search-create",
    created: Date.now(),
    content: chatEvaluation,
});

/**
 * @alpha
 */
export type AssistantMessage = AssistantTextMessage | AssistantErrorMessage | AssistantSearchCreateMessage;

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
