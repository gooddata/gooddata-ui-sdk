// (C) 2023-2024 GoodData Corporation

/**
 * A single search result returned by semantic search.
 * @alpha
 */
export interface ISemanticSearchResultItem {
    /**
     * The type of the found metadata object
     */
    type: GenAISemanticSearchType;
    /**
     * The identifier of the found metadata object
     */
    id: string;
    /**
     * The title of the found metadata object
     */
    title: string;
    /**
     * The description of the found metadata object
     */
    description: string;
}

/**
 * A single search result returned by semantic search, enriched with item URL.
 * @alpha
 */
export interface ISemanticSearchResultItemWithUrl extends ISemanticSearchResultItem {
    /**
     * The UI URL of the found metadata object, i.e. deep link in KD, AD etc.
     */
    url: string;
}

/**
 * Type of the searchable object.
 * @alpha
 */
export type GenAISemanticSearchType =
    | "dataset"
    | "attribute"
    | "label"
    | "fact"
    | "date"
    | "metric"
    | "visualization"
    | "dashboard";
