// (C) 2019-2024 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger GenAI client factory
 */
export const tigerGenAIClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "aiSearch" | "aiChat" | "aiChatStream" | "aiChatHistory"> =>
    new ActionsApi(undefined, "", axios);
