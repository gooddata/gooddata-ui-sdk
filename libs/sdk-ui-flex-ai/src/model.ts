// (C) 2024 GoodData Corporation
import { v4 as uuidv4 } from "uuid";

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
    content: string;
};

export const isUserMessage = (message: Message): message is UserMessage => message && message.role === "user";

export const makeUserMessage = (content: string): UserMessage => ({
    id: uuidv4(),
    role: "user",
    created: Date.now(),
    content,
});

/**
 * @alpha
 */
export type SystemMessage = BaseMessage & {
    role: "system";
    content: string;
};

export const isSystemMessage = (message: Message): message is SystemMessage =>
    message && message.role === "system";

export const makeSystemMessage = (content: string): SystemMessage => ({
    id: uuidv4(),
    role: "system",
    created: Date.now(),
    content,
});

/**
 * @alpha
 */
export type AssistantMessage = BaseMessage & {
    role: "assistant";
    content: string;
};

export const isAssistantMessage = (message: Message): message is AssistantMessage =>
    message && message.role === "assistant" && message.content !== null;

export const makeAssistantMessage = (content: string): AssistantMessage => ({
    id: uuidv4(),
    role: "assistant",
    created: Date.now(),
    content,
});

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
