// (C) 2024-2026 GoodData Corporation

import { GenAiApi_AiSearch } from "@gooddata/api-client-tiger/endpoints/genAI";
import { type ISemanticSearchQuery, type ISemanticSearchResult } from "@gooddata/sdk-backend-spi";
import { type GenAIObjectType } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

type SemanticSearchQueryConfig = {
    deepSearch: boolean;
    limit: number;
    question: string;
    objectTypes: GenAIObjectType[];
};

const defaultConfig: SemanticSearchQueryConfig = {
    deepSearch: true,
    limit: 10,
    question: "",
    objectTypes: [],
};

export class SemanticSearchQuery implements ISemanticSearchQuery {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
        private readonly config: SemanticSearchQueryConfig = { ...defaultConfig },
    ) {}

    withDeepSearch(deepSearch: boolean): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId, {
            ...this.config,
            deepSearch,
        });
    }

    withLimit(limit: number): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId, {
            ...this.config,
            limit,
        });
    }

    withQuestion(question: string): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId, {
            ...this.config,
            question,
        });
    }

    withObjectTypes(objectTypes: GenAIObjectType[]): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId, {
            ...this.config,
            objectTypes,
        });
    }

    async query(options?: { signal?: AbortSignal }): Promise<ISemanticSearchResult> {
        const response = await this.authCall((client) =>
            GenAiApi_AiSearch(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspaceId,
                    searchRequest: this.config,
                },
                options,
            ),
        );

        // Casting because api-client has loose typing for object type
        return response.data as ISemanticSearchResult;
    }
}
