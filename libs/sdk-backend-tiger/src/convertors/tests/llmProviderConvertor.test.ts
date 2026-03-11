// (C) 2024-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type JsonApiLlmProviderOutWithLinks } from "@gooddata/api-client-tiger";
import { type ILlmProvider, type LlmProviderPatch } from "@gooddata/sdk-model";

import {
    convertLlmProviderFromBackend,
    convertLlmProviderPatchToBackend,
    convertLlmProviderToBackend,
} from "../fromBackend/llmProviderConvertor.js";

describe("llmProviderConvertor", () => {
    it("should convert LLM provider from backend", () => {
        const backendProvider: JsonApiLlmProviderOutWithLinks = {
            id: "providerId",
            type: "llmProvider",
            attributes: {
                name: "OpenAI",
                description: "OpenAI provider",
                providerConfig: {
                    type: "OPENAI",
                    auth: {
                        type: "API_KEY",
                        apiKey: "key",
                    },
                },
                models: [{ id: "gpt-4", family: "OPENAI" }],
            },
        };

        const result = convertLlmProviderFromBackend(backendProvider);

        expect(result).toEqual({
            id: "providerId",
            name: "OpenAI",
            description: "OpenAI provider",
            providerConfig: {
                apiKey: "key",
                baseUrl: undefined,
                organization: undefined,
                type: "openAI",
            },
            models: [{ id: "gpt-4", family: "OPENAI", isDefault: false }],
        });
    });

    it("should convert LLM provider to backend", () => {
        const provider: ILlmProvider = {
            id: "providerId",
            name: "OpenAI",
            description: "OpenAI provider",
            providerConfig: {
                type: "openAI",
                apiKey: "key",
            },
            models: [{ id: "gpt-4", family: "OPENAI" }],
        };

        const result = convertLlmProviderToBackend(provider);

        expect(result).toEqual({
            type: "llmProvider",
            id: "providerId",
            attributes: {
                name: "OpenAI",
                description: "OpenAI provider",
                providerConfig: {
                    type: "OPENAI",
                    auth: {
                        apiKey: "key",
                        type: "API_KEY",
                    },
                    baseUrl: undefined,
                    organization: undefined,
                },
                models: [{ id: "gpt-4", family: "OPENAI" }],
            },
        });
    });

    it("should convert LLM provider patch to backend", () => {
        const patch: LlmProviderPatch = {
            id: "providerId",
            name: "New Name",
        };

        const result = convertLlmProviderPatchToBackend(patch);

        expect(result).toEqual({
            type: "llmProvider",
            id: "providerId",
            attributes: {
                name: "New Name",
                description: undefined,
                providerConfig: undefined,
                models: undefined,
            },
        });
    });
});
