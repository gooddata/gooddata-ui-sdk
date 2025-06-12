// (C) 2023-2025 GoodData Corporation

import { GenAIObjectType } from "./common.js";

/**
 * A single search result returned by semantic search.
 * @internal
 */
export interface ISemanticSearchResultItem {
    /**
     * The type of the found metadata object
     */
    type: GenAIObjectType;
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
    description?: string;
    /**
     * The tags of the found metadata object
     */
    tags?: string[];
    /**
     * The creation date of the found metadata object
     */
    createdAt?: string;
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
    score?: number;
    /**
     * Title score of the found item.
     */
    scoreTitle?: number;
    /**
     * Description score of the found item.
     */
    scoreDescriptor?: number;
    /**
     * 1000 if the found item is an exact match, 0 otherwise.
     */
    scoreExactMatch?: number;
}

/**
 * Reference between two metadata objects.
 * @internal
 */
export interface ISemanticSearchRelationship {
    /**
     * Workspace id of the source object
     */
    sourceWorkspaceId: string;
    /**
     * Object id of the source
     */
    sourceObjectId: string;
    /**
     * Type of the source object
     */
    sourceObjectType: GenAIObjectType;
    /**
     * Title of the source object
     */
    sourceObjectTitle: string;
    /**
     * Workspace id of the target object
     */
    targetWorkspaceId: string;
    /**
     * Object id of the target
     */
    targetObjectId: string;
    /**
     * Type of the target object
     */
    targetObjectType: GenAIObjectType;
    /**
     * Title of the target object
     */
    targetObjectTitle: string;
}
