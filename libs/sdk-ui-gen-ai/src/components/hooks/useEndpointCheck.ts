// (C) 2025-2026 GoodData Corporation

import { useCallback, useReducer } from "react";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";

import { hasUnsupportedActiveProvider } from "../utils/modelCheckUtility.js";

export function useEndpointCheck(settings: IUserWorkspaceSettings | undefined, canFullControl: boolean) {
    const backend = useBackendStrict();
    const [tries, retry] = useReducer((x) => x + 1, 0);

    const promise = async () => {
        if (!canFullControl) {
            if (settings?.enableLlmEndpointReplacement) {
                const unsupportedProvider = hasUnsupportedActiveProvider(
                    settings?.activeLlmProvider,
                    settings?.enableAiAgenticConversations,
                );
                return createInfo(0, unsupportedProvider, unsupportedProvider);
            } else {
                return createInfo();
            }
        }
        try {
            if (settings?.enableLlmEndpointReplacement) {
                return getProviderInfo(backend, settings);
            } else {
                return getEndpointInfo(backend);
            }
        } catch {
            return createInfo();
        }
    };

    const { result, status } = useCancelablePromise({ promise }, [
        backend,
        canFullControl,
        tries,
        settings?.enableLlmEndpointReplacement,
    ]);

    const restart = useCallback(() => {
        retry();
    }, []);

    return {
        checking: status === "loading" || status === "pending",
        count: result?.count ?? 0,
        evaluated: result?.evaluated ?? false,
        hasUnsupportedOpenAiModel: result?.hasUnsupportedOpenAiModel ?? false,
        restart,
    };
}

async function getProviderInfo(backend: IAnalyticalBackend, settings: IUserWorkspaceSettings | undefined) {
    const unsupportedProvider = hasUnsupportedActiveProvider(
        settings?.activeLlmProvider,
        settings?.enableAiAgenticConversations,
    );
    if (unsupportedProvider) {
        return createInfo(0, true, unsupportedProvider);
    }

    const org = await backend.organizations().getCurrentOrganization();
    const providers = await org.llmProviders().getProvidersQuery().queryAll();
    return createInfo(providers.length, true, unsupportedProvider);
}

async function getEndpointInfo(backend: IAnalyticalBackend) {
    const org = await backend.organizations().getCurrentOrganization();
    const endpoints = await org.llmEndpoints().getEndpointsQuery().queryAll();
    return createInfo(endpoints.length, true, false);
}

function createInfo(count = 0, evaluated = false, hasUnsupportedOpenAiModel = false) {
    return {
        count,
        evaluated,
        hasUnsupportedOpenAiModel,
    };
}
