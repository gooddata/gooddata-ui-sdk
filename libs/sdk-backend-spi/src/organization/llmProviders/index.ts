// (C) 2024-2026 GoodData Corporation

import {
    type ILlmProvider,
    type LlmProviderListModelsResults,
    type LlmProviderPatch,
    type LlmProviderTestResults,
} from "@gooddata/sdk-model";

import { type IPagedResource } from "../../common/paging.js";

/**
 * Service to query LLM providers.
 *
 * @alpha
 */
export interface ILlmProvidersQuery {
    /**
     * Sets number of LLM providers to return per page.
     * Default size: 100
     *
     * @param size - desired max number of LLM providers per page must be a positive number
     * @returns LLM providers query
     */
    withSize(size: number): ILlmProvidersQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns LLM providers query
     */
    withPage(page: number): ILlmProvidersQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns LLM providers query
     */
    withSorting(sort: string[]): ILlmProvidersQuery;

    /**
     * Starts the LLM providers query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<ILlmProvidersQueryResult>;

    /**
     * Starts the LLM providers query.
     *
     * @returns promise with a list of all LLM providers matching the specified options
     */
    queryAll(): Promise<ILlmProvider[]>;
}

/**
 * Queried LLM providers are returned in a paged representation.
 *
 * @alpha
 */
export type ILlmProvidersQueryResult = IPagedResource<ILlmProvider>;

/**
 * This service provides access to organization llm providers configuration.
 *
 * @alpha
 */
export interface IOrganizationLlmProvidersService {
    /**
     * Get count of all llm providers
     *
     * @returns Promise resolved with number of llm providers.
     */
    getCount(): Promise<number>;

    /**
     * Get providers query
     *
     * @returns providers query
     */
    getProvidersQuery(): ILlmProvidersQuery;

    /**
     * Delete a provider
     *
     * @param id - id of the provider
     * @returns Promise resolved when the provider is deleted.
     */
    deleteLlmProvider(id: string): Promise<void>;

    /**
     * Get llm provider by id
     *
     * @param id - id of the provider
     * @returns Promise resolved with provider.
     */
    getLlmProvider(id: string): Promise<ILlmProvider | undefined>;

    /**
     * Create a new llm provider
     *
     * @param provider - definition of the llm provider
     * @returns Promise resolved with created llm provider.
     */
    createLlmProvider(provider: ILlmProvider): Promise<ILlmProvider>;

    /**
     * Update existing llm provider
     *
     * @param provider - definition of the llm provider
     * @returns Promise resolved when the llm provider is updated.
     */
    updateLlmProvider(provider: ILlmProvider): Promise<ILlmProvider>;

    /**
     * Patch existing llm provider
     *
     * @param provider - definition of the llm provider
     * @returns Promise resolved when the llm provider is patched.
     */
    patchLlmProvider(provider: LlmProviderPatch): Promise<ILlmProvider>;

    /**
     * Test existing llm provider
     *
     * @param provider - definition of the llm provider
     * @returns Promise resolved with test results.
     */
    testLlmProvider(provider: Partial<LlmProviderPatch>): Promise<LlmProviderTestResults>;

    /**
     * List models for a provider
     *
     * @param id - id of the provider
     * @returns Promise resolved with list of models.
     *
     * @alpha
     */
    listLlmProviderModels(id: string): Promise<LlmProviderListModelsResults>;

    /**
     * List models for a provider definition
     *
     * @param provider - definition of the llm provider
     * @returns Promise resolved with list of models.
     *
     * @alpha
     */
    listLlmProviderModels(provider: Partial<LlmProviderPatch>): Promise<LlmProviderListModelsResults>;
}
