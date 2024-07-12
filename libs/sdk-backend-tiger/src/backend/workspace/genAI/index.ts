// (C) 2019-2024 GoodData Corporation

import { GenAISemanticSearchType } from "@gooddata/sdk-model";
import { IGenAIService, ISemanticSearchQuery, ISemanticSearchResult } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class GenAIService implements IGenAIService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    getSemanticSearchQuery(): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId);
    }
    async semanticSearchIndex(): Promise<void> {
        await this.authCall((client) =>
            client.actions.metadataSync({
                workspaceId: this.workspaceId,
            }),
        );
    }
}

type SemanticSearchQueryConfig = {
    deepSearch: boolean;
    limit: number;
    question: string;
    types: GenAISemanticSearchType[];
};

const defaultConfig: SemanticSearchQueryConfig = {
    deepSearch: true,
    limit: 10,
    question: "",
    types: [],
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

    withObjectTypes(types: GenAISemanticSearchType[]): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId, {
            ...this.config,
            types,
        });
    }

    async query(): Promise<ISemanticSearchResult> {
        const response = await this.authCall((client) =>
            client.execution.aiSearch({
                workspaceId: this.workspaceId,
                searchRequest: this.config,
            }),
        );

        // Casting because api-client has loose typing for object type
        return response.data as ISemanticSearchResult;
    }
}
