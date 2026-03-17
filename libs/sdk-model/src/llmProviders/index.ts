// (C) 2024-2026 GoodData Corporation

/**
 * @alpha
 */
export interface ILlmModel {
    id: string;
    family: LlmProviderFamily;
    isDefault?: boolean;
}

/**
 * @alpha
 */
export type LlmProviderFamily =
    | "OPENAI"
    | "ANTHROPIC"
    | "META"
    | "MISTRAL"
    | "AMAZON"
    | "GOOGLE"
    | "COHERE"
    | "UNKNOWN";

/**
 * @alpha
 */
export interface IOpenAIProviderConfig {
    type: "openAI";
    apiKey?: string;
    organization?: string;
    baseUrl?: string;
}

/**
 * @alpha
 */
export interface IAzureFoundryProviderConfig {
    type: "azureFoundry";
    apiKey?: string;
    endpoint: string;
}

/**
 * @alpha
 */
export interface IAwsBedrockProviderConfig {
    type: "awsBedrock";
    accessKey?: string;
    secretKey?: string;
    sessionToken?: string;
    region: string;
}

/**
 * @alpha
 */
export type LlmProviderConfig =
    | IOpenAIProviderConfig
    | IAzureFoundryProviderConfig
    | IAwsBedrockProviderConfig;

/**
 * @alpha
 */
export interface ILlmProvider {
    id: string;
    name: string | null;
    description?: string | null;
    providerConfig?: LlmProviderConfig;
    models: ILlmModel[] | null;
}

/**
 * @alpha
 */
export type LlmProviderPatch = Partial<ILlmProvider> & Pick<ILlmProvider, "id">;

/**
 * @alpha
 * Results of the llm provider test
 */
export type LlmProviderTestResults = {
    success: boolean;
    message?: string;
    models?: LlmModelsTestResults[];
};

/**
 * @alpha
 * Results of the llm models test
 */
export type LlmModelsTestResults = {
    id: string;
    success: boolean;
    message?: string;
};

/**
 * @alpha
 * Results of the list models call
 */
export type LlmProviderListModelsResults = {
    success: boolean;
    message?: string;
    models?: ILlmModel[];
};
