// (C) 2023-2026 GoodData Corporation

import type {
    GenAIChatInteractionUserFeedback,
    GenAIChatInteractionUserVisualisation,
    GenAIObjectType,
    IAllowedRelationshipType,
    IGenAIChangeAnalysisParams,
    IGenAIChatInteraction,
    IGenAIChatReasoning,
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
    ObjectType,
} from "@gooddata/sdk-model";

import type { IFilterBaseOptions } from "../../common/filtering.js";
import type { IPagedResource } from "../../common/paging.js";

/**
 * GenAI-powered features.
 * @beta
 */
export interface IGenAIService {
    /**
     * Get a knowledge documents service for listing and managing knowledge documents.
     * @internal
     */
    getKnowledgeDocuments(): IKnowledgeDocumentsService;
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
     * Filter relationships and results based on allowed relationship type combinations.
     * When specified, only relationships matching the allowed types are returned.
     */
    withAllowedRelationshipTypes(types: IAllowedRelationshipType[]): ISemanticSearchQuery;

    /**
     * The list of tags the returned objects must have.
     */
    withIncludeTags(tags: string[]): ISemanticSearchQuery;

    /**
     * The list of tags the returned objects must not have.
     */
    withExcludeTags(tags: string[]): ISemanticSearchQuery;

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
// oxlint-disable-next-line no-barrel-files/no-barrel-files
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
     * Define allowed relationships for search queries in search
     */
    withAllowedRelationshipTypes(relationshipTypes?: IAllowedRelationshipType[]): IChatThreadQuery;
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
    reasoning?: IGenAIChatReasoning;
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
     * Generates AI description for an Analytics Catalog object.
     */
    generateDescription(
        request: IAnalyticsCatalogGenerateDescriptionRequest,
    ): Promise<IAnalyticsCatalogGenerateDescriptionResponse>;

    /**
     * Generates AI title for an Analytics Catalog object.
     */
    generateTitle(
        request: IAnalyticsCatalogGenerateTitleRequest,
    ): Promise<IAnalyticsCatalogGenerateTitleResponse>;

    /**
     * Returns list of available tags in the workspace Analytics Catalog.
     */
    getTags(): Promise<IAnalyticsCatalogTags>;

    /**
     * Returns information about users who created objects in the workspace Analytics Catalog.
     */
    getCreatedBy(): Promise<IAnalyticsCatalogCreatedBy>;

    /**
     * Returns trending objects in the workspace Analytics Catalog.
     */
    getTrendingObjects(): Promise<IAnalyticsCatalogTrendingObjects>;
}

/**
 * Supported object types for AI-generated Analytics Catalog description.
 * @internal
 */
export type AnalyticsCatalogGenerateDescriptionObjectType = Extract<
    ObjectType,
    "insight" | "analyticalDashboard" | "measure" | "fact" | "attribute"
>;

/**
 * Supported object types for AI-generated Analytics Catalog title.
 * @internal
 */
export type AnalyticsCatalogGenerateTitleObjectType = AnalyticsCatalogGenerateDescriptionObjectType;

/**
 * Request payload for AI-generated Analytics Catalog description.
 * @internal
 */
export interface IAnalyticsCatalogGenerateDescriptionRequest {
    objectType: AnalyticsCatalogGenerateDescriptionObjectType;
    objectId: string;
}

/**
 * Response payload for AI-generated Analytics Catalog description.
 * @internal
 */
export interface IAnalyticsCatalogGenerateDescriptionResponse {
    description?: string;
    note?: string;
}

/**
 * Request payload for AI-generated Analytics Catalog title.
 * @internal
 */
export interface IAnalyticsCatalogGenerateTitleRequest {
    objectType: AnalyticsCatalogGenerateTitleObjectType;
    objectId: string;
}

/**
 * Response payload for AI-generated Analytics Catalog title.
 * @internal
 */
export interface IAnalyticsCatalogGenerateTitleResponse {
    title?: string;
    note?: string;
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
 * Analytics Catalog trending object.
 * @internal
 */
export interface IAnalyticsCatalogTrendingObject {
    id: string;
    type: string;
    title: string;
    tags: string[];
    createdAt?: string;
    modifiedAt?: string;
    createdBy?: string;
    modifiedBy?: string;
    isHidden?: boolean;
    isHiddenFromKda?: boolean;
    visualizationUrl?: string;
}

/**
 * Analytics Catalog trending objects response.
 * @internal
 */
export interface IAnalyticsCatalogTrendingObjects {
    objects: IAnalyticsCatalogTrendingObject[];
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

// ---------------------------------------------------------------------------
// Knowledge Documents
// ---------------------------------------------------------------------------

/**
 * Metadata for a single knowledge document stored in the knowledge base.
 * @internal
 */
export interface IKnowledgeDocumentMetadata {
    filename: string;
    workspaceId?: string;
    title?: string;
    numChunks?: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    scopes: string[];
    isDisabled?: boolean;
}

/**
 * Request payload for creating a knowledge document.
 * @internal
 */
export interface ICreateKnowledgeDocumentRequest {
    filename: string;
    content: string;
    pageBoundaries?: number[];
    title?: string;
    scopes?: string[];
}

/**
 * Response returned when a knowledge document is created.
 * @internal
 */
export interface ICreateKnowledgeDocumentResponse {
    filename: string;
    success: boolean;
    message: string;
    numChunks: number;
}

/**
 * Request payload for upserting a knowledge document.
 * Creates the document if it does not exist, updates it otherwise.
 * @internal
 */
export interface IUpsertKnowledgeDocumentRequest {
    filename: string;
    content: string;
    pageBoundaries?: number[];
    title?: string;
    scopes?: string[];
}

/**
 * Response returned when a knowledge document is upserted.
 * @internal
 */
export type IUpsertKnowledgeDocumentResponse = ICreateKnowledgeDocumentResponse;

/**
 * Response returned when a knowledge document is deleted.
 * @internal
 */
export interface IDeleteKnowledgeDocumentResponse {
    success: boolean;
    message: string;
}

/**
 * Request payload for patching a knowledge document.
 * Only provided fields will be updated.
 * @internal
 */
export interface IPatchKnowledgeDocumentRequest {
    isDisabled?: boolean;
    title?: string;
    scopes?: string[];
}

/**
 * A single result chunk returned from a knowledge base semantic search.
 * @internal
 */
export interface IKnowledgeSearchResult {
    filename: string;
    content: string;
    score: number;
    chunkIndex: number;
    totalChunks: number;
    pageNumbers: number[];
    workspaceId?: string;
    title?: string;
    scopes: string[];
}

/**
 * Statistics about a knowledge base search operation.
 * @internal
 */
export interface IKnowledgeSearchStatistics {
    totalResults: number;
    averageSimilarityScore: number;
}

/**
 * Response from a knowledge base semantic search.
 * @internal
 */
export interface ISearchKnowledgeResponse {
    results: IKnowledgeSearchResult[];
    statistics: IKnowledgeSearchStatistics;
}

/**
 * Options for a knowledge base semantic search.
 * @internal
 */
export interface ISearchKnowledgeOptions {
    limit?: number;
    minScore?: number;
    scopes?: string[];
}

/**
 * Options for listing knowledge documents with cursor-based pagination.
 * @internal
 */
export interface IListKnowledgeDocumentsOptions {
    pageSize?: number;
    pageToken?: string;
    scopes?: string[];
    /**
     * Filter documents by title/filename substring match.
     */
    query?: string;
    /**
     * Filter documents by their enabled/disabled state.
     */
    state?: "enabled" | "disabled";
}

/**
 * A single page of knowledge documents returned by the list operation.
 * @internal
 */
export interface IKnowledgeDocumentsPage {
    documents: IKnowledgeDocumentMetadata[];
    nextPageToken?: string | null;
    totalCount?: number;
}

/**
 * Service for listing and managing knowledge documents in the workspace knowledge base.
 * @internal
 */
export interface IKnowledgeDocumentsService {
    /**
     * List knowledge documents with optional cursor-based pagination.
     */
    list(options?: IListKnowledgeDocumentsOptions): Promise<IKnowledgeDocumentsPage>;

    /**
     * Get metadata for a single knowledge document by filename.
     */
    get(filename: string): Promise<IKnowledgeDocumentMetadata>;

    /**
     * Create a new knowledge document.
     * Fails if a document with the same filename already exists.
     */
    create(request: ICreateKnowledgeDocumentRequest): Promise<ICreateKnowledgeDocumentResponse>;

    /**
     * Upsert a knowledge document.
     * Creates the document if it does not exist, updates it otherwise.
     */
    upsert(request: IUpsertKnowledgeDocumentRequest): Promise<IUpsertKnowledgeDocumentResponse>;

    /**
     * Delete a knowledge document and all its chunks.
     */
    delete(filename: string): Promise<IDeleteKnowledgeDocumentResponse>;

    /**
     * Patch metadata of an existing knowledge document.
     * Only provided fields will be updated.
     */
    patch(filename: string, request: IPatchKnowledgeDocumentRequest): Promise<IKnowledgeDocumentMetadata>;

    /**
     * Search the knowledge base using semantic similarity.
     */
    search(query: string, options?: ISearchKnowledgeOptions): Promise<ISearchKnowledgeResponse>;
}
