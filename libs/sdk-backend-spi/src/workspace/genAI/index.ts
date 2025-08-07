// (C) 2023-2025 GoodData Corporation

import {
    GenAIObjectType,
    IGenAIUserContext,
    ISemanticSearchRelationship,
    ISemanticSearchResultItem,
    IGenAIChatInteraction,
    IGenAIChatRouting,
    IGenAIFoundObjects,
    IGenAICreatedVisualizations,
    GenAIChatInteractionUserFeedback,
    GenAIChatInteractionUserVisualisation,
} from "@gooddata/sdk-model";

/**
 * GenAI-powered features.
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
    reasoning?: string;
}

/**
 * Chatbot thread.
 * @beta
 */
export interface IChatThread {
    /**
     * Load chat history for the chat thread.
     */
    loadHistory(fromInteractionId?: string, options?: { signal?: AbortSignal }): Promise<IChatThreadHistory>;
    /**
     * Reset the chat thread history.
     */
    reset(): Promise<void>;
    /**
     * Save user feedback for the interaction.
     */
    saveUserFeedback(interactionId: string, feedback: GenAIChatInteractionUserFeedback): Promise<void>;
    /**
     * Save user feedback for the interaction.
     */
    saveUserVisualisation(
        interactionId: string,
        visualization: GenAIChatInteractionUserVisualisation,
    ): Promise<void>;
    /**
     * Add a user message to the chat thread.
     */
    query(userMessage: string): IChatThreadQuery;
}

/**
 * Chatbot thread history.
 * @beta
 */
export interface IChatThreadHistory {
    interactions: IGenAIChatInteraction[];
    threadId: string;
}

/**
 * Chatbot thread query builder.
 * @beta
 */
export interface IChatThreadQuery {
    /**
     * Define the limit for the number of search results returned by the chat thread.
     */
    withSearchLimit(searchLimit: number): IChatThreadQuery;
    /**
     * Define the limit for the number of created visualization returned by the chat thread.
     */
    withCreateLimit(createLimit: number): IChatThreadQuery;
    /**
     * Define the user context for the chat thread.
     * For example, what dashboard the user is currently looking at.
     */
    withUserContext(userContext: IGenAIUserContext): IChatThreadQuery;
    /**
     * Execute the chat thread.
     */
    query(options?: { signal?: AbortSignal }): Promise<IGenAIChatEvaluation>;
    /**
     * Execute the chat thread and stream the results.
     */
    stream(): ReadableStream<IGenAIChatEvaluation>;
}

/**
 * GenAI chat evaluation result.
 * @beta
 */
export interface IGenAIChatEvaluation {
    routing?: IGenAIChatRouting;
    textResponse?: string;
    foundObjects?: IGenAIFoundObjects;
    createdVisualizations?: IGenAICreatedVisualizations;
    errorResponse?: string;
    chatHistoryThreadId?: string;
    chatHistoryInteractionId?: string;
}
