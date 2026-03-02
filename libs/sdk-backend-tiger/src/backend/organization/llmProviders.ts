// (C) 2024-2026 GoodData Corporation

import { type ITigerClientBase } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityLlmProviders,
    EntitiesApi_DeleteEntityLlmProviders,
    EntitiesApi_GetAllEntitiesLlmProviders,
    EntitiesApi_GetEntityLlmProviders,
    EntitiesApi_PatchEntityLlmProviders,
    EntitiesApi_UpdateEntityLlmProviders,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    GenAiApi_TestLlmProvider,
    GenAiApi_TestLlmProviderById,
} from "@gooddata/api-client-tiger/endpoints/genAI";
import { type IOrganizationLlmProvidersService } from "@gooddata/sdk-backend-spi";
import { type ILlmProvider, type LlmProviderPatch, type LlmProviderTestResults } from "@gooddata/sdk-model";

import {
    convertLlmProviderFromBackend,
    convertLlmProviderPatchToBackend,
    convertLlmProviderToBackend,
} from "../../convertors/fromBackend/llmProviderConvertor.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class OrganizationLlmProvidersService implements IOrganizationLlmProvidersService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getCount(): Promise<number> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetAllEntitiesLlmProviders(client.axios, client.basePath, {
                size: 1,
                metaInclude: ["page"],
            });
            return result.data.meta?.page?.totalElements ?? 0;
        });
    }

    public getAll(): Promise<ILlmProvider[]> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetAllEntitiesLlmProviders(client.axios, client.basePath, {});
            const providers = result.data?.data || [];

            return providers.map(convertLlmProviderFromBackend);
        });
    }

    public getLlmProvider(id: string): Promise<ILlmProvider | undefined> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetEntityLlmProviders(client.axios, client.basePath, { id });
            const provider = result.data?.data;

            if (!provider) {
                return undefined;
            }

            return convertLlmProviderFromBackend(provider);
        });
    }

    public createLlmProvider(provider: ILlmProvider): Promise<ILlmProvider> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_CreateEntityLlmProviders(client.axios, client.basePath, {
                jsonApiLlmProviderInDocument: {
                    data: convertLlmProviderToBackend(provider),
                },
            });

            const createdProvider = result.data?.data;

            if (!createdProvider) {
                throw new Error("Failed to create LLM provider");
            }

            return convertLlmProviderFromBackend(createdProvider);
        });
    }

    public updateLlmProvider(provider: ILlmProvider): Promise<ILlmProvider> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_UpdateEntityLlmProviders(client.axios, client.basePath, {
                id: provider.id,
                jsonApiLlmProviderInDocument: {
                    data: convertLlmProviderToBackend(provider),
                },
            });

            const updatedProvider = result.data?.data;

            if (!updatedProvider) {
                throw new Error("Failed to update LLM provider");
            }

            return convertLlmProviderFromBackend(updatedProvider);
        });
    }

    public patchLlmProvider(provider: LlmProviderPatch): Promise<ILlmProvider> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_PatchEntityLlmProviders(client.axios, client.basePath, {
                id: provider.id,
                jsonApiLlmProviderPatchDocument: {
                    data: convertLlmProviderPatchToBackend(provider),
                },
            });

            const updatedProvider = result.data?.data;

            if (!updatedProvider) {
                throw new Error("Failed to update LLM provider");
            }

            return convertLlmProviderFromBackend(updatedProvider);
        });
    }

    public deleteLlmProvider(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await EntitiesApi_DeleteEntityLlmProviders(client.axios, client.basePath, { id });
        });
    }

    public testLlmProvider(provider: Partial<LlmProviderPatch>): Promise<LlmProviderTestResults> {
        return this.authCall(async (client: ITigerClientBase) => {
            if (provider.id) {
                const result = await GenAiApi_TestLlmProviderById(client.axios, client.basePath, {
                    llmProviderId: provider.id,
                });

                return {
                    success: result.data?.providerReachable,
                    message: result.data?.providerMessage,
                    models: result.data?.modelResults?.map((model) => ({
                        id: model.modelId,
                        success: model.successful,
                        message: model.message,
                    })),
                };
            }

            const patch = convertLlmProviderPatchToBackend({
                ...provider,
                id: "",
            });
            const result = await GenAiApi_TestLlmProvider(client.axios, client.basePath, {
                testLlmProviderDefinitionRequest: {
                    providerConfig: patch.attributes.providerConfig ?? {
                        type: "OPENAI",
                        auth: {
                            type: "API_KEY",
                            apiKey: "",
                        },
                    },
                    models: patch.attributes.models ?? undefined,
                },
            });

            return {
                success: result.data?.providerReachable,
                message: result.data?.providerMessage,
                models: result.data?.modelResults?.map((model) => ({
                    id: model.modelId,
                    success: model.successful,
                    message: model.message,
                })),
            };
        });
    }
}
