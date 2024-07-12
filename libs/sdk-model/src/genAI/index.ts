// (C) 2023-2024 GoodData Corporation

/**
 * A single search result returned by semantic search.
 * @alpha
 */
export interface ISemanticSearchResultItem {
    type: GenAISemanticSearchType;
    id: string;
    title: string;
    description: string;
}

/**
 * Type of the searchable object.
 * @alpha
 */
export type GenAISemanticSearchType =
    | "workspace"
    | "dataset"
    | "attribute"
    | "label"
    | "fact"
    | "data"
    | "metric"
    | "visualization"
    | "dashboard";
