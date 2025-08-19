// (C) 2024-2025 GoodData Corporation

import { ITigerClient } from "@gooddata/api-client-tiger";
import { IOrganizationLlmEndpointsService } from "@gooddata/sdk-backend-spi";
import { ILlmEndpointOpenAI, LlmEndpointOpenAIPatch, LlmEndpointTestResults } from "@gooddata/sdk-model";

import { convertLlmEndpoint } from "../../convertors/fromBackend/llmEndpointConvertor.js";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";

export class OrganizationLlmEndpointsService implements IOrganizationLlmEndpointsService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getCount(): Promise<number> {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getAllEntitiesLlmEndpoints({
                size: 1,
                metaInclude: ["page"],
            });
            return result.data.meta?.page?.totalElements ?? 0;
        });
    }

    public getAll(): Promise<ILlmEndpointOpenAI[]> {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getAllEntitiesLlmEndpoints({});
            const endpoints = result.data?.data || [];

            return endpoints.map(convertLlmEndpoint);
        });
    }

    public getLlmEndpoint(id: string): Promise<ILlmEndpointOpenAI | undefined> {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getEntityLlmEndpoints({ id });
            const endpoint = result.data?.data;

            if (!endpoint) {
                return undefined;
            }

            return convertLlmEndpoint(endpoint);
        });
    }

    public createLlmEndpoint(endpoint: ILlmEndpointOpenAI, token: string): Promise<ILlmEndpointOpenAI> {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.createEntityLlmEndpoints({
                jsonApiLlmEndpointInDocument: {
                    data: {
                        type: "llmEndpoint",
                        id: endpoint.id,
                        attributes: {
                            title: endpoint.title,
                            llmModel: endpoint.model,
                            llmOrganization: endpoint.organization,
                            provider: endpoint.provider,
                            token,
                        },
                    },
                },
            });

            const createdEndpoint = result.data?.data;

            if (!createdEndpoint) {
                throw new Error("Failed to create LLM endpoint");
            }

            return convertLlmEndpoint(createdEndpoint);
        });
    }

    public updateLlmEndpoint(endpoint: ILlmEndpointOpenAI, token: string): Promise<ILlmEndpointOpenAI> {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.updateEntityLlmEndpoints({
                id: endpoint.id,
                jsonApiLlmEndpointInDocument: {
                    data: {
                        type: "llmEndpoint",
                        id: endpoint.id,
                        attributes: {
                            title: endpoint.title,
                            llmModel: endpoint.model,
                            llmOrganization: endpoint.organization,
                            provider: endpoint.provider,
                            token,
                        },
                    },
                },
            });

            const updatedEndpoint = result.data?.data;

            if (!updatedEndpoint) {
                throw new Error("Failed to update LLM endpoint");
            }

            return convertLlmEndpoint(updatedEndpoint);
        });
    }

    public patchLlmEndpoint(endpoint: LlmEndpointOpenAIPatch, token?: string): Promise<ILlmEndpointOpenAI> {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.patchEntityLlmEndpoints({
                id: endpoint.id,
                jsonApiLlmEndpointPatchDocument: {
                    data: {
                        type: "llmEndpoint",
                        id: endpoint.id,
                        attributes: Object.fromEntries(
                            Object.entries({
                                title: endpoint.title,
                                llmModel: endpoint.model,
                                llmOrganization: endpoint.organization,
                                provider: endpoint.provider,
                                token,
                            }).filter(([_, value]) => value !== undefined),
                        ),
                    },
                },
            });

            const updatedEndpoint = result.data?.data;

            if (!updatedEndpoint) {
                throw new Error("Failed to update LLM endpoint");
            }

            return convertLlmEndpoint(updatedEndpoint);
        });
    }

    public deleteLlmEndpoint(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClient) => {
            await client.entities.deleteEntityLlmEndpoints({ id });
        });
    }

    public testLlmEndpoint(
        endpoint: Partial<LlmEndpointOpenAIPatch>,
        token?: string,
    ): Promise<LlmEndpointTestResults> {
        return this.authCall(async (client: ITigerClient) => {
            if (endpoint.id) {
                const result = await client.genAI.validateLLMEndpointById({
                    llmEndpointId: endpoint.id,
                    validateLLMEndpointByIdRequest: {
                        ...(endpoint.provider ? { provider: endpoint.provider } : {}),
                        ...(token ? { token } : {}),
                        ...(endpoint.organization ? { llmOrganization: endpoint.organization } : {}),
                        ...(endpoint.model ? { llmModel: endpoint.model } : {}),
                    },
                });

                return {
                    success: result.data?.successful,
                    message: result.data?.message,
                };
            }

            const result = await client.genAI.validateLLMEndpoint({
                validateLLMEndpointRequest: {
                    provider: endpoint.provider ?? "OPENAI",
                    token: token ?? "",
                    llmOrganization: endpoint.organization,
                    llmModel: endpoint.model,
                },
            });

            return {
                success: result.data?.successful,
                message: result.data?.message,
            };
        });
    }
}
