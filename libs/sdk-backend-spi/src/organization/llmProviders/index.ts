// (C) 2024-2026 GoodData Corporation

import { type ILlmProvider, type LlmProviderPatch, type LlmProviderTestResults } from "@gooddata/sdk-model";

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
     * Get all llm providers
     *
     * @returns Promise resolved with array of llm providers.
     */
    getAll(): Promise<ILlmProvider[]>;

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
}
