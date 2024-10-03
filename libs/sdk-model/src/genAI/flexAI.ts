// (C) 2023-2024 GoodData Corporation

import { GenAIObjectType } from "./common.js";
import { ISemanticSearchResultItem } from "./semanticSearch.js";

/**
 * User context for GenAI.
 * @alpha
 */
export interface IGenAIUserContext {
    /**
     * Active object the user is interacting with.
     */
    activeObject: GenAIActiveObject;
}

/**
 * A single chat history message.
 * @alpha
 */
export interface IGenAIChatInteraction {
    /**
     * Role of the chat interaction.
     */
    role: GenAIChatRole;
    /**
     * Content of the chat interaction.
     */
    content: GenAIChatInteractionContent[];
}

/**
 * Evaluation result of the chat, i.e. assistant's response.
 * @alpha
 */
export interface IGenAIChatEvaluation {
    /**
     * Detected use cases for the chat evaluation.
     */
    useCases?: GenAIChatUseCase[];
    /**
     * Invalid question flag.
     */
    invalidQuestion: boolean;
    /**
     * Most relevant objects for the user question.
     */
    foundObjects?: GenAIChatFoundObjects;
    /**
     * Visualizations created by the assistant.
     */
    createdVisualizations?: GenAIChatCreatedVisualizations;
}

/**
 * Active object the user is interacting with.
 * @alpha
 */
export type GenAIActiveObject = {
    id: string;
    workspaceId: string;
    type: GenAIObjectType;
};

/**
 * Role of the chat interaction.
 * @alpha
 */
export type GenAIChatRole = "USER" | "AI";

/**
 * Content of the chat interaction.
 * @alpha
 */
export type GenAIChatInteractionContent =
    | GenAIChatTextInteractionContent
    | GenAIChatSearchInteractionContent
    | GenAIChatVisualizationInteractionContent;

/**
 * Base content of the chat interaction.
 * @alpha
 */
export type GenAIChatBaseInteractionContent = {
    includeToChatContext: boolean;
    userFeedback: "POSITIVE" | "NEGATIVE" | "NONE";
};

/**
 * Textual answer from the assistant.
 * @alpha
 */
export type GenAIChatTextInteractionContent = GenAIChatBaseInteractionContent & {
    text: string;
};

/**
 * Search result from the assistant.
 * @alpha
 */
export type GenAIChatSearchInteractionContent = GenAIChatBaseInteractionContent & {
    foundObject: ISemanticSearchResultItem;
};

/**
 * Visualization created by the assistant.
 * @alpha
 */
export type GenAIChatVisualizationInteractionContent = GenAIChatBaseInteractionContent & {
    createdVisualization: GenAIChatCreatedVisualization;
};

/**
 * Type of the visualization.
 * @alpha
 */
export type GenAIChatVisualizationType = "TABLE" | "HEADLINE" | "BAR" | "LINE" | "PIE" | "COLUMN";

/**
 * Type of the metric.
 * @alpha
 */
export type GenAIChatMetricType = "metric" | "fact" | "attribute";

/**
 * Aggregation function for the metric.
 * @alpha
 */
export type GenAIChatMetricAggregation = "COUNT" | "SUM" | "MIN" | "MAX" | "AVG" | "MEDIAN";

/**
 * Visualization definition created by the assistant.
 * @alpha
 */
export type GenAIChatCreatedVisualization = {
    id: string;
    title: string;
    visualizationType: GenAIChatVisualizationType;
    metrics: GenAIChatCreatedVisualizationMetric[];
    dimensionality: GenAIChatCreatedVisualizationDimension[];
};

/**
 * Metric definition for the visualization.
 * @alpha
 */
export type GenAIChatCreatedVisualizationMetric = {
    id: string;
    type: GenAIChatMetricType;
    aggFunction: GenAIChatMetricAggregation;
};

/**
 * Dimension definition for the visualization.
 * @alpha
 */
export type GenAIChatCreatedVisualizationDimension = {
    id: string;
    type: "attribute";
};

/**
 * Use case for the chat evaluation.
 * @alpha
 */
export type GenAIChatUseCase = {
    useCase: string;
    exampleDescription?: string;
    score: number;
};

/**
 * Visualizations created by the assistant.
 * @alpha
 */
export type GenAIChatCreatedVisualizations = {
    objects?: GenAIChatCreatedVisualization[];
    reasoning: string;
};

/**
 * Found objects related to the user question.
 * @alpha
 */
export type GenAIChatFoundObjects = {
    objects?: ISemanticSearchResultItem[];
    reasoning: string;
};
