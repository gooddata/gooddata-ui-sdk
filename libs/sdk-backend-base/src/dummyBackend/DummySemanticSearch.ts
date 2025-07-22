// (C) 2024-2025 GoodData Corporation

import { ISemanticSearchQuery } from "@gooddata/sdk-backend-spi";
import { GenAIObjectType, ISemanticSearchRelationship } from "@gooddata/sdk-model";

/**
 * Dummy query builder for semantic search testing
 * @internal
 */
export class DummySemanticSearchQueryBuilder implements ISemanticSearchQuery {
    constructor(private readonly workspaceId: string) {}
    question = "";
    withQuestion(question: string) {
        this.question = question;
        return this;
    }
    withLimit() {
        return this;
    }
    withObjectTypes() {
        return this;
    }
    withDeepSearch() {
        return this;
    }
    async query({ signal }: { signal?: AbortSignal } = {}) {
        await cancellableTimeout(100, signal);
        return {
            results: [
                "dataset",
                "attribute",
                "label",
                "fact",
                "date",
                "metric",
                "visualization",
                "dashboard",
            ].map((type) => ({
                id: type,
                type: type as GenAIObjectType,
                workspaceId: this.workspaceId,
                title: `${type} title`,
                description: this.question,
                tags: [] as string[],
                createdAt: "2023-08-03T13:17:26.923537",
                modifiedAt: "2023-08-03T13:17:26.923537",
                visualizationUrl: type === "visualization" ? "local:line" : undefined,
                score: 0.5,
                scoreTitle: 0.5,
                scoreDescriptor: 0.5,
                scoreExactMatch: 0,
            })),
            relationships: [] as ISemanticSearchRelationship[],
        };
    }
}

const cancellableTimeout = async (ms: number, signal?: AbortSignal) => {
    return new Promise((res, rej) => {
        if (signal?.aborted) {
            rej(signal.reason);
            return;
        }

        const abortHandler = () => rej(signal?.reason);
        signal?.addEventListener("abort", abortHandler);

        const timeoutId = setTimeout(() => {
            signal?.removeEventListener("abort", abortHandler);
            res(undefined);
        }, ms);

        // If already aborted, clear timeout
        if (signal?.aborted) {
            clearTimeout(timeoutId);
            rej(signal.reason);
        }
    });
};
