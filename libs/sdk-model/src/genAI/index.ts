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
     * The identifier of the workspace where the found metadata object is located
     */
    workspaceId: string;
    /**
     * The title of the found metadata object
     */
    title: string;
    /**
     * The description of the found metadata object
     */
    description: string;
    /**
     * The tags of the found metadata object
     */
    tags: string[];
    /**
     * The creation date of the found metadata object
     */
    createdAt: string;
    /**
     * The last modification date of the found metadata object
     */
    modifiedAt?: string;
    /**
     * Represents the type of chart for visualization objects
     */
    visualizationUrl?: string;
    /**
     * Overall similarity score of the found item.
     * Larger is more similar.
     */
    score: number;
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

/**
 * Reference between two metadata objects.
 * @alpha
 */
export type ISemanticSearchRelationship = {
    sourceWorkspaceId: string;
    sourceObjectId: string;
    sourceObjectType: GenAISemanticSearchType;
    sourceObjectTitle: string;
    targetWorkspaceId: string;
    targetObjectId: string;
    targetObjectType: GenAISemanticSearchType;
    targetObjectTitle: string;
};
