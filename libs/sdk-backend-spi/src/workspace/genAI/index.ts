// (C) 2023-2025 GoodData Corporation

import type {
    GenAIChatInteractionUserFeedback,
    GenAIChatInteractionUserVisualisation,
    GenAIObjectType,
    IGenAIChangeAnalysisParams,
    IGenAIChatInteraction,
    IGenAIChatRouting,
    IGenAICreatedVisualizations,
    IGenAIFoundObjects,
    IGenAIUserContext,
    ILlmEndpointBase,
    IMemoryItemDefinition,
    IMemoryItemMetadataObject,
    ISemanticQualityIssuesCalculation,
    ISemanticQualityReport,
    ISemanticSearchResult,
    IUser,
    MemoryItemStrategy,
    ObjectOrigin,
} from "@gooddata/sdk-model";

import type { IFilterBaseOptions } from "../../common/filtering.js";
import type { IPagedResource } from "../../common/paging.js";

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
    getMemoryItems(): IMemoryItemsService;

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

    /**
     * Get list of available LLM endpoints.
     */
    getLlmEndpoints(): Promise<ILlmEndpointBase[]>;
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
 * Semantic search result payload.
 * @beta
 * @deprecated Use `ISemanticSearchResult` from \@gooddata/sdk-model instead.
 */
export type { ISemanticSearchResult };

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
    saveUserFeedback(
        interactionId: string,
        feedback: GenAIChatInteractionUserFeedback,
        userTextFeedback?: string,
    ): Promise<void>;
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
     * Define the object types for the chat thread.
     */
    withObjectTypes(objectTypes?: GenAIObjectType[]): IChatThreadQuery;
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
export interface IMemoryItemsService {
    /**
     * Get a memory items query builder.
     */
    getMemoryItemsQuery(): IMemoryItemsQuery;

    /**
     * Create a new memory item.
     */
    create(item: IMemoryItemDefinition): Promise<IMemoryItemMetadataObject>;

    /**
     * Update an existing memory item.
     */
    update(id: string, item: IMemoryItemDefinition): Promise<IMemoryItemMetadataObject>;

    /**
     * Patch an existing memory item.
     */
    patch(id: string, item: Partial<IMemoryItemDefinition>): Promise<IMemoryItemMetadataObject>;

    /**
     * Delete a memory item.
     */
    delete(id: string): Promise<void>;

    /**
     * Get memory created by users.
     */
    getCreatedByUsers(): Promise<IMemoryCreatedByUsers>;
}

/**
 * GenAI chat evaluation result.
 * @beta
 */
export interface IGenAIChatEvaluation {
    routing?: IGenAIChatRouting;
    textResponse?: string;
    /** @deprecated Use `semanticSearch` property instead. */
    foundObjects?: IGenAIFoundObjects;
    semanticSearch?: ISemanticSearchResult;
    createdVisualizations?: IGenAICreatedVisualizations;
    changeAnalysisParams?: IGenAIChangeAnalysisParams;
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
     * Returns a report of quality issues detected in the workspace metadata.
     */
    getQualityReport(options?: { signal?: AbortSignal }): Promise<ISemanticQualityReport>;

    /**
     * Triggers asynchronous calculation of metadata quality issues.
     */
    triggerQualityIssuesCalculation(): Promise<ISemanticQualityIssuesCalculation>;
}

/**
 * Memory items filter options.
 * @public
 */
export interface IMemoryItemsFilterOptions extends IFilterBaseOptions {
    strategy?: MemoryItemStrategy[];
    excludeStrategy?: MemoryItemStrategy[];
    isDisabled?: boolean;
}

/**
 * Memory created by users response.
 * @internal
 */
export interface IMemoryCreatedByUsers {
    reasoning: string;
    users: IUser[];
}

/**
 * Service to query memory items.
 *
 * @public
 */
export interface IMemoryItemsQuery {
    /**
     * Sets number of memory items to return per page.
     * Default size: 50
     *
     * @param size - desired max number of memory items per page must be a positive number
     * @returns memory items query
     */
    withSize(size: number): IMemoryItemsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns memory items query
     */
    withPage(page: number): IMemoryItemsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns memory items query
     */
    withFilter(filter: IMemoryItemsFilterOptions): IMemoryItemsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns memory items query
     */
    withSorting(sort: string[]): IMemoryItemsQuery;

    /**
     * Sets include for the query.
     *
     * @param include - include to apply
     * @returns memory items query
     */
    withInclude(include: string[]): IMemoryItemsQuery;

    /**
     * Sets origin for the query.
     *
     * @param origin - origin to apply. This is an open string union to allow platform-specific origin values in addition to the built-in literals.
     * @returns memory items query
     */
    withOrigin(origin: ObjectOrigin | (string & {})): IMemoryItemsQuery;

    /**
     * Starts the query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IMemoryItemsQueryResult>;
}

/**
 * Memory items query result.
 * @internal
 */
export type IMemoryItemsQueryResult = IPagedResource<IMemoryItemMetadataObject>;
