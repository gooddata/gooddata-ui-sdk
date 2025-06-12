// (C) 2024-2025 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import {
    GenAIChatRoutingUseCase,
    GenAIChatInteractionUserFeedback,
    IGenAIVisualization,
    ISemanticSearchResultItem,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export type TextContentObject = {
    id: string;
    type: "metric" | "attribute" | "fact" | "dataset";
    title: string;
};

/**
 * @public
 */
export type TextContents = {
    type: "text";
    text: string;
    objects: TextContentObject[];
};

/**
 * @internal
 */
export const isTextContents = (contents: Contents): contents is TextContents => contents.type === "text";

/**
 * @internal
 */
export const makeTextContents = (text: string, objects: TextContentObject[]): TextContents => ({
    type: "text",
    text,
    objects,
});

/**
 * @public
 */
export type RoutingContents = {
    type: "routing";
    text: string;
    useCase: GenAIChatRoutingUseCase;
};

/**
 * @internal
 */
export const isRoutingContents = (contents: Contents): contents is RoutingContents =>
    contents.type === "routing";

/**
 * @internal
 */
export const makeRoutingContents = (text: string, useCase: GenAIChatRoutingUseCase): RoutingContents => ({
    type: "routing",
    text,
    useCase,
});

/**
 * @public
 */
export type SearchContents = {
    type: "search";
    text: string;
    searchResults: ISemanticSearchResultItem[];
};

/**
 * @internal
 */
export const isSearchContents = (contents: Contents): contents is SearchContents =>
    contents.type === "search";

/**
 * @internal
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
 * @public
 */
export type VisualizationContents = {
    type: "visualization";
    text: string;
    createdVisualizations: IGenAIVisualization[];
};

/**
 * @internal
 */
export const isVisualizationContents = (contents: Contents): contents is VisualizationContents =>
    contents.type === "visualization";

/**
 * @internal
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
 * @public
 */
export type ErrorContents = {
    type: "error";
    text: string;
};

/**
 * @internal
 */
export const isErrorContents = (contents: Contents): contents is ErrorContents => contents.type === "error";

/**
 * @internal
 */
export const makeErrorContents = (text: string): ErrorContents => ({
    type: "error",
    text,
});

/**
 * @public
 */
export type Contents =
    | TextContents
    | RoutingContents
    | SearchContents
    | VisualizationContents
    | ErrorContents;

/**
 * @public
 */
export type BaseMessage = {
    /**
     * Server-side ID for the message.
     */
    id?: string;
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
 * @public
 */
export type UserMessage = BaseMessage & {
    role: "user";
};

/**
 * @internal
 */
export const isUserMessage = (message?: Message): message is UserMessage => message?.role === "user";

/**
 * @internal
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
 * @public
 */
export type AssistantMessage = BaseMessage & {
    role: "assistant";
    feedback: GenAIChatInteractionUserFeedback;
};

/**
 * @internal
 */
export const isAssistantMessage = (message?: Message): message is AssistantMessage =>
    message?.role === "assistant";

/**
 * Create a new Assistant message. By default, mark it as incomplete.
 * @internal
 */
export const makeAssistantMessage = (
    content: Contents[],
    complete = false,
    id?: string,
    feedback: GenAIChatInteractionUserFeedback = "NONE",
): AssistantMessage => ({
    id: id,
    localId: uuidv4(),
    role: "assistant",
    created: Date.now(),
    cancelled: false,
    feedback,
    complete,
    content,
});

/**
 * All messages that can be stored in history.
 * @public
 */
export type Message = UserMessage | AssistantMessage;
