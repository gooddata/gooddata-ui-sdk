// (C) 2024-2026 GoodData Corporation

import {
    type JsonApiLlmProviderIn,
    type JsonApiLlmProviderInAttributesProviderConfig,
    type JsonApiLlmProviderOutWithLinks,
    type JsonApiLlmProviderPatch,
} from "@gooddata/api-client-tiger";
import {
    type ILlmModel,
    type ILlmProvider,
    type LlmProviderConfig,
    type LlmProviderPatch,
} from "@gooddata/sdk-model";

export function convertLlmProviderFromBackend(provider: JsonApiLlmProviderOutWithLinks): ILlmProvider {
    const { attributes, id } = provider;
    return {
        id,
        name: attributes?.name ?? null,
        description: attributes?.description,
        providerConfig: convertLlmProviderConfigFromBackend(
            attributes?.providerConfig as JsonApiLlmProviderInAttributesProviderConfig,
        ),
        models:
            attributes?.models?.map((model): ILlmModel => {
                return {
                    id: model.id,
                    family: model.family,
                    isDefault: model.id === attributes.defaultModelId,
                };
            }) ?? null,
    };
}

export function convertLlmProviderToBackend(provider: ILlmProvider): JsonApiLlmProviderIn {
    return {
        type: "llmProvider",
        id: provider.id,
        attributes: {
            name: provider.name,
            description: provider.description,
            defaultModelId: provider.models?.find((model) => model.isDefault)?.id,
            providerConfig: convertLlmProviderConfigToBackend(provider?.providerConfig),
            models:
                provider.models?.map((model) => ({
                    id: model.id,
                    family: model.family,
                })) ?? null,
        },
    };
}

export function convertLlmProviderPatchToBackend(provider: LlmProviderPatch): JsonApiLlmProviderPatch {
    return {
        type: "llmProvider",
        id: provider.id,
        attributes: {
            name: provider.name,
            description: provider.description,
            defaultModelId: provider.models?.find((model) => model.isDefault)?.id,
            ...(provider.providerConfig
                ? {
                      providerConfig: convertLlmProviderConfigToBackend(provider.providerConfig),
                  }
                : {}),
            models:
                provider.models?.map((model) => ({
                    id: model.id,
                    family: model.family,
                })) ?? undefined,
        },
    };
}

function convertLlmProviderConfigToBackend(
    config: LlmProviderConfig | undefined | null,
): JsonApiLlmProviderInAttributesProviderConfig | undefined {
    if (!config) {
        return undefined;
    }
    switch (config.type) {
        case "openAI":
            return {
                type: "OPENAI",
                organization: config.organization,
                baseUrl: config.baseUrl,
                auth: {
                    type: "API_KEY",
                    apiKey: config.apiKey,
                },
            };
        case "awsBedrock":
            return {
                type: "AWS_BEDROCK",
                region: config.region,
                auth: {
                    type: "ACCESS_KEY",
                    accessKeyId: config.accessKey,
                    secretAccessKey: config.secretKey,
                    sessionToken: config.sessionToken,
                },
            };
        case "azureFoundry":
            return {
                type: "AZURE_FOUNDRY",
                endpoint: config.endpoint,
                auth: {
                    type: "API_KEY",
                    apiKey: config.apiKey,
                },
            };
    }
}

function convertLlmProviderConfigFromBackend(
    config: JsonApiLlmProviderInAttributesProviderConfig | null | undefined,
): LlmProviderConfig | undefined {
    if (!config) {
        return undefined;
    }
    switch (config.type) {
        case "OPENAI":
            return {
                type: "openAI",
                organization: config.organization ?? undefined,
                baseUrl: config.baseUrl ?? undefined,
                apiKey: config.auth.apiKey ?? undefined,
            };
        case "AWS_BEDROCK":
            return {
                type: "awsBedrock",
                accessKey: config.auth.accessKeyId ?? undefined,
                secretKey: config.auth.secretAccessKey ?? undefined,
                sessionToken: config.auth.sessionToken ?? undefined,
                region: config.region,
            };
        case "AZURE_FOUNDRY":
            return {
                type: "azureFoundry",
                endpoint: config.endpoint,
                apiKey: config.auth.apiKey ?? undefined,
            };
    }
}
