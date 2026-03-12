// (C) 2023-2026 GoodData Corporation

import {
    type ILlmEndpointOpenAI,
    type LlmEndpointOpenAIPatch,
    type LlmEndpointTestResults,
} from "@gooddata/sdk-model";

import { type IPagedResource } from "../../common/paging.js";

/**
 * Service to query LLM endpoints.
 *
 * @alpha
 */
export interface ILlmEndpointsQuery {
    /**
     * Sets number of LLM endpoints to return per page.
     * Default size: 100
     *
     * @param size - desired max number of LLM endpoints per page must be a positive number
     * @returns LLM endpoints query
     */
    withSize(size: number): ILlmEndpointsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns LLM endpoints query
     */
    withPage(page: number): ILlmEndpointsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns LLM endpoints query
     */
    withSorting(sort: string[]): ILlmEndpointsQuery;

    /**
     * Starts the LLM endpoints query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<ILlmEndpointsQueryResult>;

    /**
     * Starts the LLM endpoints query.
     *
     * @returns promise with a list of all LLM endpoints matching the specified options
     */
    queryAll(): Promise<ILlmEndpointOpenAI[]>;
}

/**
 * Queried LLM endpoints are returned in a paged representation.
 *
 * @alpha
 */
export type ILlmEndpointsQueryResult = IPagedResource<ILlmEndpointOpenAI>;

/**
 * This service provides access to organization llm endpoints configuration.
 *
 * @alpha
 */
export interface IOrganizationLlmEndpointsService {
    /**
     * Get count of all llm endpoints
     *
     * @returns Promise resolved with number of llm endpoints.
     */
    getCount(): Promise<number>;

    /**
     * Get endpoints query
     *
     * @returns endpoints query
     */
    getEndpointsQuery(): ILlmEndpointsQuery;

    /**
     * Delete an endpoint
     *
     * @param id - id of the endpoint
     * @returns Promise resolved when the endpoint is deleted.
     */
    deleteLlmEndpoint(id: string): Promise<void>;

    /**
     * Get llm endpoint by id
     *
     * @param id - id of the endpoint
     * @returns Promise resolved with endpoint.
     */
    getLlmEndpoint(id: string): Promise<ILlmEndpointOpenAI | undefined>;

    /**
     * Create a new llm endpoint
     *
     * @param endpoint - definition of the llm endpoint
     * @param token - token for the llm endpoint, if applicable
     * @returns Promise resolved with created llm endpoint.
     */
    createLlmEndpoint(endpoint: ILlmEndpointOpenAI, token?: string): Promise<ILlmEndpointOpenAI>;

    /**
     * Update existing llm endpoint
     *
     * @param endpoint - definition of the llm endpoint
     * @param token - token for the llm endpoint, if applicable
     * @returns Promise resolved when the llm endpoint is updated.
     */
    updateLlmEndpoint(endpoint: ILlmEndpointOpenAI, token?: string): Promise<ILlmEndpointOpenAI>;

    /**
     * Patch existing llm endpoint
     *
     * @param endpoint - definition of the llm endpoint
     * @param token - token for the llm endpoint, if applicable
     * @returns Promise resolved when the llm endpoint is patched.
     */
    patchLlmEndpoint(endpoint: LlmEndpointOpenAIPatch, token?: string): Promise<ILlmEndpointOpenAI>;

    /**
     * Test existing llm endpoint
     *
     * @param endpoint - definition of the llm endpoint
     * @param token - token for the llm endpoint, if applicable
     * @returns Promise resolved with test results.
     */
    testLlmEndpoint(
        endpoint: Partial<LlmEndpointOpenAIPatch>,
        token?: string,
    ): Promise<LlmEndpointTestResults>;
}
