// (C) 2024-2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type JsonApiLlmEndpointOutDocument,
    type JsonApiLlmEndpointOutList,
} from "@gooddata/api-client-tiger";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type ILlmEndpointOpenAI } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { OrganizationLlmEndpointsService } from "../llmEndpoints.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesLlmEndpoints: vi.fn(),
    EntitiesApi_GetEntityLlmEndpoints: vi.fn(),
    EntitiesApi_CreateEntityLlmEndpoints: vi.fn(),
    EntitiesApi_UpdateEntityLlmEndpoints: vi.fn(),
    EntitiesApi_PatchEntityLlmEndpoints: vi.fn(),
    EntitiesApi_DeleteEntityLlmEndpoints: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/genAI", () => ({
    GenAiApi_ValidateLLMEndpoint: vi.fn(),
    GenAiApi_ValidateLLMEndpointById: vi.fn(),
}));

describe("OrganizationLlmEndpointsService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    const service = new OrganizationLlmEndpointsService(mockAuthCall as TigerAuthenticatedCallGuard);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should get count of LLM endpoints", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesLlmEndpoints).mockResolvedValue({
            data: {
                meta: {
                    page: {
                        totalElements: 5,
                    },
                },
            },
        } as AxiosResponse<JsonApiLlmEndpointOutList>);

        const count = await service.getCount();

        expect(count).toBe(5);
        expect(api.EntitiesApi_GetAllEntitiesLlmEndpoints).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            {
                size: 1,
                metaInclude: ["page"],
            },
        );
    });

    it("should get LLM endpoints query", async () => {
        vi.mocked(api.EntitiesApi_GetAllEntitiesLlmEndpoints).mockResolvedValue({
            data: {
                data: [
                    {
                        id: "e1",
                        type: "llmEndpoint",
                        attributes: { title: "Endpoint 1", provider: "OPENAI", llmModel: "gpt-4" },
                    },
                ],
                meta: {
                    page: {
                        totalElements: 1,
                    },
                },
            },
        } as unknown as AxiosResponse<JsonApiLlmEndpointOutList>);

        const result = await service.getEndpointsQuery().query();

        expect(result.items).toHaveLength(1);
        expect(result.items[0].id).toBe("e1");
        expect(api.EntitiesApi_GetAllEntitiesLlmEndpoints).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                size: 100,
            }),
        );
    });

    it("should get LLM endpoint by id", async () => {
        vi.mocked(api.EntitiesApi_GetEntityLlmEndpoints).mockResolvedValue({
            data: {
                data: {
                    id: "e1",
                    type: "llmEndpoint",
                    attributes: { title: "Endpoint 1", provider: "OPENAI", llmModel: "gpt-4" },
                },
            },
        } as unknown as AxiosResponse<JsonApiLlmEndpointOutDocument>);

        const result = await service.getLlmEndpoint("e1");

        expect(result?.id).toBe("e1");
        expect(api.EntitiesApi_GetEntityLlmEndpoints).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            { id: "e1" },
        );
    });

    it("should create LLM endpoint", async () => {
        vi.mocked(api.EntitiesApi_CreateEntityLlmEndpoints).mockResolvedValue({
            data: {
                data: {
                    id: "e1",
                    type: "llmEndpoint",
                    attributes: { title: "Endpoint 1", provider: "OPENAI", llmModel: "gpt-4" },
                },
            },
        } as unknown as AxiosResponse<JsonApiLlmEndpointOutDocument>);

        const endpoint: ILlmEndpointOpenAI = {
            id: "e1",
            title: "Endpoint 1",
            provider: "OPENAI",
            model: "gpt-4",
        };

        const result = await service.createLlmEndpoint(endpoint, "token");

        expect(result.id).toBe("e1");
        expect(api.EntitiesApi_CreateEntityLlmEndpoints).toHaveBeenCalled();
    });

    it("should delete LLM endpoint", async () => {
        vi.mocked(api.EntitiesApi_DeleteEntityLlmEndpoints).mockResolvedValue({} as unknown as AxiosResponse);

        await service.deleteLlmEndpoint("e1");

        expect(api.EntitiesApi_DeleteEntityLlmEndpoints).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            { id: "e1" },
        );
    });
});
