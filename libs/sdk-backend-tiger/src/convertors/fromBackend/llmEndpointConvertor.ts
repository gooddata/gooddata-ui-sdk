// (C) 2024 GoodData Corporation
import { JsonApiLlmEndpointOutWithLinks } from "@gooddata/api-client-tiger";
import { ILlmEndpointOpenAI } from "@gooddata/sdk-model";

export function convertLlmEndpoint(endpoint: JsonApiLlmEndpointOutWithLinks): ILlmEndpointOpenAI {
    if (endpoint.attributes?.provider === "OPENAI") {
        return {
            id: endpoint.id,
            title: endpoint.attributes?.title,
            description: endpoint.attributes?.description,
            provider: "OPENAI",
            model: endpoint.attributes?.llmModel,
            organization: endpoint.attributes?.llmOrganization,
        } as ILlmEndpointOpenAI;
    }

    throw new Error(`Unknown llm endpoint provider: ${endpoint.attributes?.provider}`);
}
