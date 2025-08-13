// (C) 2022-2025 GoodData Corporation

/**
 * Base endpoint interface
 *
 * @alpha
 */
export interface ILlmEndpointBase {
    /**
     * Endpoint identifier
     */
    id: string;
    /**
     * Endpoint title
     */
    title: string;
}

/**
 * OpenAI endpoint interface
 *
 * @alpha
 */
export interface ILlmEndpointOpenAI extends ILlmEndpointBase {
    /**
     * A discriminating type of the endpoint
     */
    provider: "OPENAI" | "AZURE_OPENAI";
    /**
     * Optional organization identifier for OpenAI
     */
    organization?: string;
    /**
     * A modal to use with OpenAI
     */
    model: string;
}

/**
 * Patched OpenAI endpoint interface. All fields except the `id` are optional.
 *
 * @alpha
 */
export type LlmEndpointOpenAIPatch = Partial<ILlmEndpointOpenAI> & Pick<ILlmEndpointOpenAI, "id">;

/**
 * @alpha
 * Results of the llm endpoint test
 */
export type LlmEndpointTestResults = {
    success: boolean;
    message?: string;
};
