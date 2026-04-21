// (C) 2026 GoodData Corporation

import { type ILlmActiveProvider } from "@gooddata/sdk-model";

const OPEN_AI_SUPPORTED_VERSION = {
    major: 5,
    minor: 2,
};

const GPT_MODEL_VERSION_PATTERN = /^(?:gpt-(\d+)(?:\.(\d+))?|o([134]))/i;

export function isSupportedOpenAiModel(modelId: string | undefined): {
    isSupported: boolean;
    isOpenAi: boolean;
} {
    if (!modelId) {
        return {
            isSupported: false,
            isOpenAi: false,
        };
    }

    const match = modelId.toLowerCase().match(GPT_MODEL_VERSION_PATTERN);
    if (!match) {
        return {
            isSupported: false,
            isOpenAi: false,
        };
    }

    const major = Number(match[1] ?? match[3]);
    const minor = match[2] ? Number(match[2]) : 0;

    if (major > OPEN_AI_SUPPORTED_VERSION.major) {
        return {
            isSupported: true,
            isOpenAi: true,
        };
    }

    if (major < OPEN_AI_SUPPORTED_VERSION.major) {
        return {
            isSupported: false,
            isOpenAi: true,
        };
    }

    return {
        isSupported: minor >= OPEN_AI_SUPPORTED_VERSION.minor,
        isOpenAi: true,
    };
}

export function hasUnsupportedActiveProvider(
    provider: ILlmActiveProvider | undefined,
    enableAiAgenticConversations: boolean | undefined,
): boolean {
    if (provider && enableAiAgenticConversations) {
        const { defaultModelId } = provider;
        const { isOpenAi, isSupported } = isSupportedOpenAiModel(defaultModelId);
        if (!isOpenAi) {
            return false;
        }
        return !isSupported;
    }
    return false;
}
