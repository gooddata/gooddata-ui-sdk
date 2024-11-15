// (C) 2024 GoodData Corporation
import {
    IChatThread,
    IChatThreadHistory,
    IChatThreadQuery,
    IGenAIChatEvaluation,
} from "@gooddata/sdk-backend-spi";
import { GenAIChatInteractionUserFeedback } from "@gooddata/sdk-model";

/**
 * Dummy chat thread interface for testing.
 * @internal
 */
export class DummyGenAIChatThread implements IChatThread {
    async loadHistory(
        _fromInteractionId: number,
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
    async saveUserFeedback(
        _interactionId: number,
        _feedback: GenAIChatInteractionUserFeedback,
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
