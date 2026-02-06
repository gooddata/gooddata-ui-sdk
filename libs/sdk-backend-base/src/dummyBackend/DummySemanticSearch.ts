// (C) 2024-2026 GoodData Corporation

import { type ISemanticSearchQuery } from "@gooddata/sdk-backend-spi";
import {
    type GenAIObjectType,
    type IAllowedRelationshipType,
    type ISemanticSearchRelationship,
} from "@gooddata/sdk-model";

const ALL_RESULT_TYPES: GenAIObjectType[] = [
    "dataset",
    "attribute",
    "label",
    "fact",
    "date",
    "metric",
    "visualization",
    "dashboard",
];

/**
 * Dummy query builder for semantic search testing.
 * When allowedRelationshipTypes is set (e.g. viewer: dashboard only), filters results to matching source types
 * so Backstop and Storybook match real backend behavior.
 * @internal
 */
export class DummySemanticSearchQueryBuilder implements ISemanticSearchQuery {
    constructor(private readonly workspaceId: string) {}
    question = "";
    private allowedRelationshipTypes: IAllowedRelationshipType[] | undefined;
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
    withAllowedRelationshipTypes(allowedRelationshipTypes: IAllowedRelationshipType[]) {
        this.allowedRelationshipTypes = allowedRelationshipTypes;
        return this;
    }
    async query({ signal }: { signal?: AbortSignal } = {}) {
        await cancellableTimeout(100, signal);
        const sourceTypes = new Set(this.allowedRelationshipTypes?.map((r) => r.sourceType) ?? []);
        const types =
            sourceTypes.size > 0 ? ALL_RESULT_TYPES.filter((t) => sourceTypes.has(t)) : ALL_RESULT_TYPES;
        return {
            results: types.map((type) => ({
                id: type as string,
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
        }
        signal?.addEventListener("abort", () => rej(signal.reason));
        setTimeout(res, ms);
    });
};
