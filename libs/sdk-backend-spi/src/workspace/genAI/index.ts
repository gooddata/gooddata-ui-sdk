// (C) 2023-2024 GoodData Corporation

import { GenAISemanticSearchType, ISemanticSearchResultItem } from "@gooddata/sdk-model";

/**
 * GenAI-powered semantic search service.
 * @alpha
 */
export interface IGenAIService {
    getSemanticSearchQuery(): ISemanticSearchQuery;
    semanticSearchIndex(): Promise<void>;
}

/**
 * Semantic search query.
 * @alpha
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
    query(): Promise<ISemanticSearchResult>;
}

/**
 * A single search result returned by semantic search.
 * @alpha
 */
export interface ISemanticSearchResult {
    results: ISemanticSearchResultItem[];
}
