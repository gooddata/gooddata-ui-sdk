// (C) 2023-2024 GoodData Corporation

import {
    GenAISemanticSearchType,
    ISemanticSearchRelationship,
    ISemanticSearchResultItem,
} from "@gooddata/sdk-model";

/**
 * GenAI-powered semantic search service.
 * @beta
 */
export interface IGenAIService {
    /**
     * Get a semantic search query builder.
     */
    getSemanticSearchQuery(): ISemanticSearchQuery;

    /**
     * Trigger a reindex of the semantic search index for the workspace.
     */
    semanticSearchIndex(): Promise<void>;
}

/**
 * Semantic search query.
 * @beta
 */
export interface ISemanticSearchQuery {
    /**
     * Define a search term for the search.
     */
    withQuestion(question: string): ISemanticSearchQuery;

    /**
     * Define a limit for the number of results returned by the search.
     */
    withLimit(limit: number): ISemanticSearchQuery;

    /**
     * Define a list of object types to search for.
     */
    withObjectTypes(types: GenAISemanticSearchType[]): ISemanticSearchQuery;

    /**
     * Define whether the search should be deep or not.
     */
    withDeepSearch(deepSearch: boolean): ISemanticSearchQuery;

    /**
     * Execute the search.
     */
    query(options?: { signal?: AbortSignal }): Promise<ISemanticSearchResult>;
}

/**
 * A single search result returned by semantic search.
 * @beta
 */
export interface ISemanticSearchResult {
    results: ISemanticSearchResultItem[];
    relationships: ISemanticSearchRelationship[];
}
