// (C) 2022-2024 GoodData Corporation

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
    /**
     * Endpoint description
     */
    description?: string;
    /**
     * A list of workspace identifier this endpoint should be used for
     */
    workspaceIds: string[];
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
    provider: "OPENAI";
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
