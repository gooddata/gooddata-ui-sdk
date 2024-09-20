// (C) 2024 GoodData Corporation
import { IChatThread } from "@gooddata/sdk-backend-spi";
import { IGenAIChatEvaluation } from "@gooddata/sdk-model";

/**
 * Dummy query builder for GenAI chat
 * @internal
 */
export class DummyGenAIChatThread implements IChatThread {
    withChatHistory(): IChatThread {
        return this;
    }

    withSearchLimit(): IChatThread {
        return this;
    }

    withUserContext(): IChatThread {
        return this;
    }

    withCreateLimit(): IChatThread {
        return this;
    }

    withQuestion(): IChatThread {
        return this;
    }

    async query({ signal }: { signal?: AbortSignal }): Promise<IGenAIChatEvaluation> {
        await cancellableTimeout(100, signal);
        return Promise.resolve({
            invalidQuestion: false,
            useCases: [],
        });
    }
}

const cancellableTimeout = async (ms: number, signal?: AbortSignal) => {
    return new Promise((res, rej) => {
        if (signal?.aborted) {
            rej(signal.reason);
        }
        signal?.addEventListener("abort", () => rej(signal.reason));
        setTimeout(res, ms);
    });
};
