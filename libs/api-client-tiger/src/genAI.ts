// (C) 2019-2025 GoodData Corporation

import { AxiosInstance } from "axios";

import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger GenAI client factory
 */
export const tigerGenAIClientFactory = (
    axios: AxiosInstance,
): Pick<
    ActionsApiInterface,
    | "aiSearch"
    | "aiChat"
    | "aiChatStream"
    | "aiChatHistory"
    | "validateLLMEndpoint"
    | "validateLLMEndpointById"
    // Memory endpoints are currently not generated; we will call them via axios directly in backend.
> => new ActionsApi(undefined, "", axios);
