// (C) 2024 GoodData Corporation

import { ISemanticSearchQuery, ISemanticSearchResult } from "@gooddata/sdk-backend-spi";
import { GenAIObjectType } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

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
            client.genAI.aiSearch(
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
