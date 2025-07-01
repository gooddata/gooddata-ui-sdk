// (C) 2024-2025 GoodData Corporation
import { JsonApiLlmEndpointOutWithLinks } from "@gooddata/api-client-tiger";
import { ILlmEndpointOpenAI } from "@gooddata/sdk-model";

export function convertLlmEndpoint(endpoint: JsonApiLlmEndpointOutWithLinks): ILlmEndpointOpenAI {
    if (endpoint.attributes?.provider === "OPENAI") {
        return {
            id: endpoint.id,
            title: endpoint.attributes?.title,
            provider: "OPENAI",
            model: endpoint.attributes?.llmModel,
            organization: endpoint.attributes?.llmOrganization,
        } as ILlmEndpointOpenAI;
    }
    if (endpoint.attributes?.provider === "AZURE_OPENAI") {
        return {
            id: endpoint.id,
            title: endpoint.attributes?.title,
            provider: "AZURE_OPENAI",
            model: endpoint.attributes?.llmModel,
            organization: endpoint.attributes?.llmOrganization,
        } as ILlmEndpointOpenAI;
    }

    throw new Error(`Unknown llm endpoint provider: ${endpoint.attributes?.provider}`);
}
