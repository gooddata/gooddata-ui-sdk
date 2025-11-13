// (C) 2024-2025 GoodData Corporation

import {
    IChatThread,
    IChatThreadHistory,
    IChatThreadQuery,
    IGenAIChatEvaluation,
} from "@gooddata/sdk-backend-spi";
import { GenAIChatInteractionUserFeedback, GenAIChatInteractionUserVisualisation } from "@gooddata/sdk-model";

/**
 * Dummy chat thread interface for testing.
 * @internal
 */
export class DummyGenAIChatThread implements IChatThread {
    async loadHistory(
        _fromInteractionId: string,
        { signal }: { signal?: AbortSignal },
    ): Promise<IChatThreadHistory> {
        await cancellableTimeout(100, signal);
        return Promise.resolve({
            interactions: [],
            threadId: "",
        });
    }
    async reset(): Promise<void> {
        await cancellableTimeout(100);
    }
    async saveUserVisualisation(
        _interactionId: string,
        _visualization: GenAIChatInteractionUserVisualisation,
    ): Promise<void> {}
    async saveUserFeedback(
        _interactionId: string,
        _feedback: GenAIChatInteractionUserFeedback,
        _userTextFeedback?: string,
    ): Promise<void> {}
    async saveRenderVisualisationStatus(
        _interactionId: string,
        _status: "SUCCESSFUL" | "UNEXPECTED_ERROR" | "TOO_MANY_DATA_POINTS" | "NO_DATA" | "NO_RESULTS",
    ): Promise<void> {}
    query(_userMessage: string): IChatThreadQuery {
        return new DummyGenAIChatQueryBuilder();
    }
}

/**
 * Dummy query builder for GenAI chat
 * @internal
 */
export class DummyGenAIChatQueryBuilder implements IChatThreadQuery {
    withSearchLimit(): IChatThreadQuery {
        return this;
    }

    withCreateLimit(): IChatThreadQuery {
        return this;
    }

    withUserContext(): IChatThreadQuery {
        return this;
    }

    withObjectTypes(): IChatThreadQuery {
        return this;
    }

    async query({ signal }: { signal?: AbortSignal }): Promise<IGenAIChatEvaluation> {
        await cancellableTimeout(100, signal);
        return Promise.resolve({
            routing: {
                useCase: "GENERAL",
                reasoning: "",
            },
            textResponse: "",
            foundObjects: {
                objects: [],
                reasoning: "",
            },
            createdVisualizations: {
                objects: [],
                reasoning: "",
            },
        });
    }

    stream(): ReadableStream<IGenAIChatEvaluation> {
        return new ReadableStream({
            start: async (controller) => {
                await cancellableTimeout(100);
                controller.enqueue({
                    routing: {
                        useCase: "GENERAL",
                        reasoning: "",
                    },
                    textResponse: "",
                    foundObjects: {
                        objects: [],
                        reasoning: "",
                    },
                    createdVisualizations: {
                        objects: [],
                        reasoning: "",
                    },
                });
            },
        });
    }
}

const cancellableTimeout = async (ms: number, signal?: AbortSignal) => {
    return new Promise((res, rej) => {
        if (signal?.aborted) {
            rej(signal.reason);
        }
        const tm = setTimeout(res, ms);
        signal?.addEventListener("abort", () => {
            clearTimeout(tm);
            rej(signal.reason);
        });
    });
};
