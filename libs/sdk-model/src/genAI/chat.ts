// (C) 2023-2025 GoodData Corporation

import { GenAIObjectType } from "./common.js";
import { ISemanticSearchResultItem } from "./semanticSearch.js";

/**
 * Role of the chat interaction.
 * @internal
 */
export type GenAIChatRole = "USER" | "AI";

/**
 * User feedback for the chat interaction.
 * @public
 */
export type GenAIChatInteractionUserFeedback = "POSITIVE" | "NEGATIVE" | "NONE";

/**
 * User visualization for the chat interaction.
 * @internal
 */
export type GenAIChatInteractionUserVisualisation = {
    /**
     * ID of the visualization that server created.
     */
    createdId: string;
    /**
     * ID of the visualization that was saved by the user.
     */
    savedId: string;
};

/**
 * A route that was detected by the assistant based on the user question.
 * @internal
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
 * @internal
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
 * @internal
 */
export interface IGenAIUserContext {
    /**
     * Active object the user is interacting with.
     */
    activeObject: IGenAIActiveObject;
}

/**
 * Active object the user is interacting with.
 * @internal
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
 * @internal
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
    /**
     * Suggestions for the visualization.
     */
    suggestions?: IGenAISuggestion[];
    /**
     * A visualization ID in case it was saved.
     */
    savedVisualizationId?: string;
    /**
     * A flag indicating if visualization is being saved right now
     */
    saving?: boolean;
    /**
     * A flag indicating if visualization status waiting for report
     */
    statusReportPending?: boolean;
}

/**
 * Positive attribute filter definition for the visualization.
 * @internal
 */
export type GenAIPositiveAttributeFilter = {
    using: string;
    include: Array<string | null>;
};

/**
 * Negative attribute filter definition for the visualization.
 * @internal
 */
export type GenAINegativeAttributeFilter = {
    using: string;
    exclude: Array<string | null>;
};

/**
 * Absolute date filter definition for the visualization.
 * @internal
 */
export type GenAIAbsoluteDateFilter = {
    using: string;
    from: string;
    to: string;
};

/**
 * Relative date filter definition for the visualization.
 * @internal
 */
export type GenAIRelativeDateFilter = {
    using: string;
    granularity: GenAIDateGranularity;
    from: number;
    to: number;
};

/**
 * Date granularity for the relative date filter.
 * @internal
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
 * @internal
 */
export type GenAIFilter =
    | GenAIPositiveAttributeFilter
    | GenAINegativeAttributeFilter
    | GenAIAbsoluteDateFilter
    | GenAIRelativeDateFilter;

/**
 * Suggestion for the visualization.
 * @internal
 */
export type IGenAISuggestion = {
    /**
     * The actual suggestion.
     */
    query: string;
    /**
     * The label of the suggestion.
     */
    label: string;
};

/**
 * Type of the visualization.
 * @internal
 */
export type GenAIVisualizationType = "TABLE" | "HEADLINE" | "BAR" | "LINE" | "PIE" | "COLUMN";

/**
 * Metric definition for the visualization.
 * @internal
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
     * Title of the metric.
     */
    title?: string;
    /**
     * Aggregation function for the metric.
     */
    aggFunction?: GenAIMetricAggregation;
}

/**
 * Type of the metric.
 * @internal
 */
export type GenAIMetricType = "metric" | "fact" | "attribute";

/**
 * Aggregation function for the metric.
 * @internal
 */
export type GenAIMetricAggregation = "COUNT" | "SUM" | "MIN" | "MAX" | "AVG" | "MEDIAN";

/**
 * Dimension definition for the visualization.
 * @internal
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
 * @internal
 */
export interface IGenAIChatInteraction {
    /**
     * User question.
     */
    question: string;
    /**
     * ID of the interaction within the thread.
     */
    chatHistoryInteractionId: string;
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
    /**
     * An error message in case the interaction failed.
     */
    errorResponse?: string;
}

/**
 * A list of found objects for a given interaction
 * @internal
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
 * @internal
 */
export interface IGenAICreatedVisualizations {
    /**
     * List of created visualizations.
     */
    objects?: IGenAIVisualization[];
    /**
     * Assistant reasoning on how the visualizations were created.
     */
    reasoning: string;
}
