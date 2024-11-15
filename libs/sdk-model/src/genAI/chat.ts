// (C) 2023-2024 GoodData Corporation

import { GenAIObjectType } from "./common.js";
import { ISemanticSearchResultItem } from "./semanticSearch.js";

/**
 * Role of the chat interaction.
 * @alpha
 */
export type GenAIChatRole = "USER" | "AI";

/**
 * User feedback for the chat interaction.
 * @alpha
 */
export type GenAIChatInteractionUserFeedback = "POSITIVE" | "NEGATIVE" | "NONE";

/**
 * A route that was detected by the assistant based on the user question.
 * @alpha
 */
export type GenAIChatRoutingUseCase =
    | "SEARCH_ALL"
    | "SEARCH_VISUALIZATIONS"
    | "SEARCH_DASHBOARDS"
    | "CREATE_VISUALIZATION"
    | "EXTEND_VISUALIZATION"
    | "GENERAL"
    | "INVALID";

/**
 * Routing for the chat interaction.
 * @alpha
 */
export interface IGenAIChatRouting {
    /**
     * Detected use case for the routing.
     */
    useCase: GenAIChatRoutingUseCase;
    /**
     * Assistant reasoning on why the use case was detected.
     */
    reasoning: string;
}

/**
 * User context for GenAI.
 * @alpha
 */
export interface IGenAIUserContext {
    /**
     * Active object the user is interacting with.
     */
    activeObject: IGenAIActiveObject;
}

/**
 * Active object the user is interacting with.
 * @alpha
 */
export interface IGenAIActiveObject {
    /**
     * ID of the object.
     */
    id: string;
    /**
     * ID of the workspace the object belongs to.
     */
    workspaceId: string;
    /**
     * Type of the object.
     */
    type: GenAIObjectType;
}

/**
 * Visualization definition created by the assistant.
 * @alpha
 */
export interface IGenAIVisualization {
    /**
     * ID of the visualization.
     */
    id: string;
    /**
     * Title of the visualization.
     */
    title: string;
    /**
     * Type of the visualization.
     */
    visualizationType: GenAIVisualizationType;
    /**
     * Metrics used in the visualization.
     */
    metrics: IGenAIVisualizationMetric[];
    /**
     * Dimensions used in the visualization.
     */
    dimensionality: IGenAIVisualizationDimension[];
    /**
     * Filters used in the visualization.
     */
    filters?: GenAIFilter[];
}

/**
 * Positive attribute filter definition for the visualization.
 * @alpha
 */
export type GenAIPositiveAttributeFilter = {
    using: string;
    include: Array<string | null>;
};

/**
 * Negative attribute filter definition for the visualization.
 * @alpha
 */
export type GenAINegativeAttributeFilter = {
    using: string;
    exclude: Array<string | null>;
};

/**
 * Absolute date filter definition for the visualization.
 * @alpha
 */
export type GenAIAbsoluteDateFilter = {
    using: string;
    from: string;
    to: string;
};

/**
 * Relative date filter definition for the visualization.
 * @alpha
 */
export type GenAIRelativeDateFilter = {
    using: string;
    granularity: GenAIDateGranularity;
    from: number;
    to: number;
};

/**
 * Date granularity for the relative date filter.
 * @alpha
 */
export type GenAIDateGranularity =
    | "MINUTE"
    | "HOUR"
    | "DAY"
    | "WEEK"
    | "MONTH"
    | "QUARTER"
    | "YEAR"
    | "MINUTE_OF_HOUR"
    | "HOUR_OF_DAY"
    | "DAY_OF_WEEK"
    | "DAY_OF_MONTH"
    | "DAY_OF_YEAR"
    | "WEEK_OF_YEAR"
    | "MONTH_OF_YEAR"
    | "QUARTER_OF_YEAR";

/**
 * Filter definition for the visualization.
 * @alpha
 */
export type GenAIFilter =
    | GenAIPositiveAttributeFilter
    | GenAINegativeAttributeFilter
    | GenAIAbsoluteDateFilter
    | GenAIRelativeDateFilter;

/**
 * Type of the visualization.
 * @alpha
 */
export type GenAIVisualizationType = "TABLE" | "HEADLINE" | "BAR" | "LINE" | "PIE" | "COLUMN";

/**
 * Metric definition for the visualization.
 * @alpha
 */
export interface IGenAIVisualizationMetric {
    /**
     * ID of the object used in metric.
     */
    id: string;
    /**
     * Type of the object used in the metric.
     */
    type: GenAIMetricType;
    /**
     * Aggregation function for the metric.
     */
    aggFunction?: GenAIMetricAggregation;
}

/**
 * Type of the metric.
 * @alpha
 */
export type GenAIMetricType = "metric" | "fact" | "attribute";

/**
 * Aggregation function for the metric.
 * @alpha
 */
export type GenAIMetricAggregation = "COUNT" | "SUM" | "MIN" | "MAX" | "AVG" | "MEDIAN";

/**
 * Dimension definition for the visualization.
 * @alpha
 */
export interface IGenAIVisualizationDimension {
    /**
     * ID of the object used in dimension.
     */
    id: string;
    /**
     * Type of the object used in the dimension.
     */
    type: "attribute";
}

/**
 * A singe user - assistant chat interaction.
 * @alpha
 */
export interface IGenAIChatInteraction {
    /**
     * User question.
     */
    question: string;
    /**
     * ID of the interaction within the thread.
     */
    chatHistoryInteractionId: number;
    /**
     * Flag indicating whether the interaction is finished.
     */
    interactionFinished: boolean;
    /**
     * Routing for the interaction.
     */
    routing: IGenAIChatRouting;
    /**
     * A generic text response from the assistant.
     */
    textResponse?: string;
    /**
     * A list of found objects for the interaction.
     */
    foundObjects?: IGenAIFoundObjects;
    /**
     * A list of created visualizations for the interaction.
     */
    createdVisualizations?: IGenAICreatedVisualizations;
    /**
     * User feedback for the assistant reply.
     */
    userFeedback?: GenAIChatInteractionUserFeedback;
}

/**
 * A list of found objects for a given interaction
 * @alpha
 */
export interface IGenAIFoundObjects {
    /**
     * List of found objects.
     */
    objects: ISemanticSearchResultItem[];
    /**
     * Assistant reasoning on how the objects were matched.
     */
    reasoning: string;
}

/**
 * A list of created visualizations for a given interaction
 * @alpha
 */
export interface IGenAICreatedVisualizations {
    /**
     * List of created visualizations.
     */
    objects: IGenAIVisualization[];
    /**
     * Assistant reasoning on how the visualizations were created.
     */
    reasoning: string;
}
