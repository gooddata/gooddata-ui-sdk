// (C) 2023-2025 GoodData Corporation

import {
    GenAIChatInteractionUserFeedback,
    GenAIChatInteractionUserVisualisation,
    GenAIObjectType,
    IGenAIChatInteraction,
    IGenAIChatRouting,
    IGenAICreatedVisualizations,
    IGenAIFoundObjects,
    IGenAIMemoryItem,
    IGenAIMemoryItemCreate,
    IGenAIUserContext,
    ISemanticQualityIssue,
    ISemanticSearchRelationship,
    ISemanticSearchResultItem,
    type IUser,
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

    /**
     * Get a memory service for listing and managing memory items.
     * @internal
     */
    getMemory(): IMemoryService;

    /**
     * Get Analytics Catalog related APIs.
     * @internal
     */
    getAnalyticsCatalog(): IAnalyticsCatalogService;

    /**
     * Get semantic quality related APIs.
     * @internal
     */
    getSemanticQuality(): ISemanticQualityService;
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
     * Save render visualisation status for the interaction.
     */
    saveRenderVisualisationStatus(
        interactionId: string,
        status: "SUCCESSFUL" | "UNEXPECTED_ERROR" | "TOO_MANY_DATA_POINTS" | "NO_DATA" | "NO_RESULTS",
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
 * Memory service.
 * @internal
 */
export interface IMemoryService {
    /**
     * List all memory items.
     */
    list(options?: { signal?: AbortSignal }): Promise<IGenAIMemoryItem[]>;

    /**
     * Create a new memory item.
     */
    create(item: IGenAIMemoryItemCreate): Promise<IGenAIMemoryItem>;

    /**
     * Update an existing memory item.
     */
    update(id: string, item: IGenAIMemoryItemCreate): Promise<IGenAIMemoryItem>;

    /**
     * Delete a memory item.
     */
    remove(id: string): Promise<void>;
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

/**
 * GenAI Analytics Catalog service.
 * @internal
 */
export interface IAnalyticsCatalogService {
    /**
     * Returns list of available tags in the workspace Analytics Catalog.
     */
    getTags(): Promise<IAnalyticsCatalogTags>;

    /**
     * Returns information about users who created objects in the workspace Analytics Catalog.
     */
    getCreatedBy(): Promise<IAnalyticsCatalogCreatedBy>;
}

/**
 * Analytics Catalog tags response.
 * @internal
 */
export interface IAnalyticsCatalogTags {
    tags: string[];
}

/**
 * Analytics Catalog creators response.
 * @internal
 */
export interface IAnalyticsCatalogCreatedBy {
    reasoning: string;
    users: IUser[];
}

/**
 * Semantic quality service.
 * @internal
 */
export interface ISemanticQualityService {
    /**
     * Returns list of quality issues detected in the workspace metadata.
     */
    getQualityIssues(): Promise<ISemanticQualityIssue[]>;
}
