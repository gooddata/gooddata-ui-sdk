// (C) 2024-2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type JsonApiLlmProviderOutDocument,
    type JsonApiLlmProviderOutList,
} from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import * as genAiApi from "@gooddata/api-client-tiger/endpoints/genAI";
import { type ILlmProvider, type LlmProviderPatch } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { OrganizationLlmProvidersService } from "../llmProviders.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesLlmProviders: vi.fn(),
    EntitiesApi_GetEntityLlmProviders: vi.fn(),
    EntitiesApi_CreateEntityLlmProviders: vi.fn(),
    EntitiesApi_UpdateEntityLlmProviders: vi.fn(),
    EntitiesApi_PatchEntityLlmProviders: vi.fn(),
    EntitiesApi_DeleteEntityLlmProviders: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/genAI", () => ({
    GenAiApi_TestLlmProvider: vi.fn(),
    GenAiApi_TestLlmProviderById: vi.fn(),
}));

describe("OrganizationLlmProvidersService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    const service = new OrganizationLlmProvidersService(mockAuthCall as TigerAuthenticatedCallGuard);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should get count of LLM providers", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesLlmProviders).mockResolvedValue({
            data: {
                meta: {
                    page: {
                        totalElements: 5,
                    },
                },
            },
        } as AxiosResponse<JsonApiLlmProviderOutList>);

        const count = await service.getCount();

        expect(count).toBe(5);
        expect(api.EntitiesApi_GetAllEntitiesLlmProviders).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            {
                size: 1,
                metaInclude: ["page"],
            },
        );
    });

    it("should get all LLM providers", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesLlmProviders).mockResolvedValue({
            data: {
                data: [
                    {
                        id: "p1",
                        type: "llmProvider",
                        attributes: { name: "Provider 1", providerConfig: { type: "openAI" } },
                    },
                ],
            },
        } as unknown as AxiosResponse<JsonApiLlmProviderOutList>);

        const result = await service.getAll();

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("p1");
        expect(api.EntitiesApi_GetAllEntitiesLlmProviders).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            {},
        );
    });

    it("should get LLM provider by id", async () => {
        vi.mocked(api.EntitiesApi_GetEntityLlmProviders).mockResolvedValue({
            data: {
                data: {
                    id: "p1",
                    type: "llmProvider",
                    attributes: { name: "Provider 1", providerConfig: { type: "openAI" } },
                },
            },
        } as unknown as AxiosResponse<JsonApiLlmProviderOutDocument>);

        const result = await service.getLlmProvider("p1");

        expect(result?.id).toBe("p1");
        expect(api.EntitiesApi_GetEntityLlmProviders).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            { id: "p1" },
        );
    });

    it("should return undefined if LLM provider not found", async () => {
        vi.mocked(api.EntitiesApi_GetEntityLlmProviders).mockResolvedValue({
            data: {
                data: undefined,
            },
        } as unknown as AxiosResponse<JsonApiLlmProviderOutDocument>);

        const result = await service.getLlmProvider("p1");

        expect(result).toBeUndefined();
    });

    it("should create LLM provider", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityLlmProviders).mockResolvedValue({
            data: {
                data: {
                    id: "p1",
                    type: "llmProvider",
                    attributes: { name: "Provider 1", providerConfig: { type: "openAI" } },
                },
            },
        } as unknown as AxiosResponse<JsonApiLlmProviderOutDocument>);

        const provider: ILlmProvider = {
            id: "p1",
            name: "Provider 1",
            providerConfig: { type: "openAI", apiKey: "test-key" },
            models: [],
        };

        const result = await service.createLlmProvider(provider);

        expect(result.id).toBe("p1");
        expect(api.EntitiesApi_CreateEntityLlmProviders).toHaveBeenCalled();
    });

    it("should update LLM provider", async () => {
        vi.mocked(api.EntitiesApi_UpdateEntityLlmProviders).mockResolvedValue({
            data: {
                data: {
                    id: "p1",
                    type: "llmProvider",
                    attributes: { name: "Provider 1", providerConfig: { type: "openAI" } },
                },
            },
        } as unknown as AxiosResponse<JsonApiLlmProviderOutDocument>);

        const provider: ILlmProvider = {
            id: "p1",
            name: "Provider 1",
            providerConfig: { type: "openAI", apiKey: "test-key" },
            models: [],
        };

        const result = await service.updateLlmProvider(provider);

        expect(result.id).toBe("p1");
        expect(api.EntitiesApi_UpdateEntityLlmProviders).toHaveBeenCalled();
    });

    it("should patch LLM provider", async () => {
        vi.mocked(api.EntitiesApi_PatchEntityLlmProviders).mockResolvedValue({
            data: {
                data: {
                    id: "p1",
                    type: "llmProvider",
                    attributes: { name: "New Name", providerConfig: { type: "openAI" } },
                },
            },
        } as unknown as AxiosResponse<JsonApiLlmProviderOutDocument>);

        const patch: LlmProviderPatch = {
            id: "p1",
            name: "New Name",
        };

        const result = await service.patchLlmProvider(patch);

        expect(result.name).toBe("New Name");
        expect(api.EntitiesApi_PatchEntityLlmProviders).toHaveBeenCalled();
    });

    it("should delete LLM provider", async () => {
        vi.mocked(api.EntitiesApi_DeleteEntityLlmProviders).mockResolvedValue({} as unknown as AxiosResponse);

        await service.deleteLlmProvider("p1");

        expect(api.EntitiesApi_DeleteEntityLlmProviders).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            { id: "p1" },
        );
    });

    describe("testLlmProvider", () => {
        it("should test LLM provider by ID", async () => {
            vi.mocked(genAiApi.GenAiApi_TestLlmProviderById).mockResolvedValue({
                data: {
                    providerReachable: true,
                    providerMessage: "Connected",
                    modelResults: [{ modelId: "gpt-4", successful: true, message: "OK" }],
                },
            } as AxiosResponse);

            const patch: LlmProviderPatch = {
                id: "p1",
            };

            const result = await service.testLlmProvider(patch);

            expect(result.success).toBe(true);
            expect(result.message).toBe("Connected");
            expect(result.models?.[0].id).toBe("gpt-4");
            expect(genAiApi.GenAiApi_TestLlmProviderById).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                { llmProviderId: "p1" },
            );
        });

        it("should test LLM provider by definition", async () => {
            vi.mocked(genAiApi.GenAiApi_TestLlmProvider).mockResolvedValue({
                data: {
                    providerReachable: false,
                    providerMessage: "Error",
                    modelResults: [],
                },
            } as AxiosResponse);

            const patch: LlmProviderPatch = {
                id: "",
                providerConfig: { type: "openAI", apiKey: "key" },
            };

            const result = await service.testLlmProvider(patch);

            expect(result.success).toBe(false);
            expect(result.message).toBe("Error");
            expect(genAiApi.GenAiApi_TestLlmProvider).toHaveBeenCalled();
        });
    });
});
