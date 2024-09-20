// (C) 2023-2024 GoodData Corporation

import {
    GenAIObjectType,
    IGenAIChatEvaluation,
    IGenAIChatInteraction,
    IGenAIUserContext,
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

    /**
     * Get a chatbot thread builder.
     */
    getChatThread(): IChatThread;
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
    withObjectTypes(types: GenAIObjectType[]): ISemanticSearchQuery;

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

/**
 * Chatbot thread builder.
 * @alpha
 */
export interface IChatThread {
    /**
     * Define the next user message in the chat thread.
     */
    withQuestion(question: string): IChatThread;

    /**
     * Define the limit for the number of search results returned by the chat thread.
     */
    withSearchLimit(searchLimit: number): IChatThread;

    /**
     * Define the limit for the number of created visualization returned by the chat thread.
     */
    withCreateLimit(createLimit: number): IChatThread;

    /**
     * Define the user context for the chat thread.
     * For example, what dashboard the user is currently looking at.
     */
    withUserContext(userContext: IGenAIUserContext): IChatThread;

    /**
     * Define the chat history for the chat thread.
     */
    withChatHistory(chatHistory: IGenAIChatInteraction[]): IChatThread;

    /**
     * Execute the chat thread.
     */
    query(options?: { signal?: AbortSignal }): Promise<IGenAIChatEvaluation>;
}
