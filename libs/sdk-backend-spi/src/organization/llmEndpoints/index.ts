// (C) 2023-2025 GoodData Corporation

import { ILlmEndpointOpenAI, LlmEndpointOpenAIPatch, LlmEndpointTestResults } from "@gooddata/sdk-model";

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
     * Get all llm endpoints
     *
     * @returns Promise resolved with array of llm endpoints.
     */
    getAll(): Promise<ILlmEndpointOpenAI[]>;

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
