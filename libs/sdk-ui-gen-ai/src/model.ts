// (C) 2024 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import {
    GenAIChatRoutingUseCase,
    GenAIChatInteractionUserFeedback,
    IGenAIVisualization,
    ISemanticSearchResultItem,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export type TextContents = {
    type: "text";
    text: string;
};

/**
 * @alpha
 */
export const isTextContents = (contents: Contents): contents is TextContents => contents.type === "text";

/**
 * @alpha
 */
export const makeTextContents = (text: string): TextContents => ({
    type: "text",
    text,
});

/**
 * @alpha
 */
export type RoutingContents = {
    type: "routing";
    text: string;
    useCase: GenAIChatRoutingUseCase;
};

/**
 * @alpha
 */
export const isRoutingContents = (contents: Contents): contents is RoutingContents =>
    contents.type === "routing";

/**
 * @alpha
 */
export const makeRoutingContents = (text: string, useCase: GenAIChatRoutingUseCase): RoutingContents => ({
    type: "routing",
    text,
    useCase,
});

/**
 * @alpha
 */
export type SearchContents = {
    type: "search";
    text: string;
    searchResults: ISemanticSearchResultItem[];
};

/**
 * @alpha
 */
export const isSearchContents = (contents: Contents): contents is SearchContents =>
    contents.type === "search";

/**
 * @alpha
 */
export const makeSearchContents = (
    text: string,
    searchResults: ISemanticSearchResultItem[] = [],
): SearchContents => ({
    type: "search",
    text,
    searchResults,
});

/**
 * @alpha
 */
export type VisualizationContents = {
    type: "visualization";
    text: string;
    createdVisualizations: IGenAIVisualization[];
};

/**
 * @alpha
 */
export const isVisualizationContents = (contents: Contents): contents is VisualizationContents =>
    contents.type === "visualization";

/**
 * @alpha
 */
export const makeVisualizationContents = (
    text: string,
    createdVisualizations: IGenAIVisualization[] = [],
): VisualizationContents => ({
    type: "visualization",
    text,
    createdVisualizations,
});

/**
 * @alpha
 */
export type ErrorContents = {
    type: "error";
    text: string;
};

/**
 * @alpha
 */
export const isErrorContents = (contents: Contents): contents is ErrorContents => contents.type === "error";

/**
 * @alpha
 */
export const makeErrorContents = (text: string): ErrorContents => ({
    type: "error",
    text,
});

/**
 * @alpha
 */
export type Contents =
    | TextContents
    | RoutingContents
    | SearchContents
    | VisualizationContents
    | ErrorContents;

/**
 * @alpha
 */
export type BaseMessage = {
    /**
     * Server-side ID for the message.
     */
    id?: number;
    /**
     * Local ID for the message. We need the id right away for optimistic rendering.
     */
    localId: string;
    /**
     * A timestamp of the message creation.
     */
    created: number;
    /**
     * Specifies if the message processing was cancelled.
     */
    cancelled: boolean;
    /**
     * Specifies if the message processing is complete.
     */
    complete: boolean;
    /**
     * The contents of the message.
     */
    content: Contents[];
};

/**
 * @alpha
 */
export type UserMessage = BaseMessage & {
    role: "user";
};

/**
 * @alpha
 */
export const isUserMessage = (message?: Message): message is UserMessage => message?.role === "user";

/**
 * @alpha
 */
export const makeUserMessage = (content: Contents[]): UserMessage => ({
    localId: uuidv4(),
    role: "user",
    created: Date.now(),
    cancelled: false,
    complete: true,
    content,
});

/**
 * @alpha
 */
export type AssistantMessage = BaseMessage & {
    role: "assistant";
    feedback: GenAIChatInteractionUserFeedback;
};

/**
 * @alpha
 */
export const isAssistantMessage = (message?: Message): message is AssistantMessage =>
    message?.role === "assistant";

/**
 * Create a new Assistant message. By default, mark it as incomplete.
 * @alpha
 */
export const makeAssistantMessage = (
    content: Contents[],
    complete = false,
    id?: number,
): AssistantMessage => ({
    id: id,
    localId: uuidv4(),
    role: "assistant",
    feedback: "NONE",
    created: Date.now(),
    cancelled: false,
    complete,
    content,
});

/**
 * All messages that can be stored in history.
 * @alpha
 */
export type Message = UserMessage | AssistantMessage;
