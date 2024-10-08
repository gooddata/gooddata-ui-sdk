// (C) 2024 GoodData Corporation

import { IGenAIUserContext } from "@gooddata/sdk-model";
import {
    IChatThread,
    IChatThreadHistory,
    IChatThreadQuery,
    IGenAIChatEvaluation,
} from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Chat thread service.
 * @beta
 */
export class ChatThreadService implements IChatThread {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    async loadHistory(
        fromInteractionId?: number,
        options?: { signal?: AbortSignal },
    ): Promise<IChatThreadHistory> {
        const response = await this.authCall((client) => {
            return client.genAI.aiChatHistory(
                {
                    workspaceId: this.workspaceId,
                    chatHistoryRequest: {
                        chatHistoryInteractionId: fromInteractionId,
                    },
                },
                options,
            );
        });

        return response.data as IChatThreadHistory;
    }

    async reset(): Promise<void> {
        await this.authCall((client) => {
            return client.genAI.aiChatHistory({
                workspaceId: this.workspaceId,
                chatHistoryRequest: {
                    reset: true,
                },
            });
        });
    }

    query(userMessage: string): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, {
            workspaceId: this.workspaceId,
            userQuestion: userMessage,
        });
    }
}

/**
 * Chat thread query configuration.
 * @beta
 */
export type ChatThreadQueryConfig = {
    workspaceId: string;
    userQuestion: string;
    limitSearch?: number;
    limitCreate?: number;
    userContext?: IGenAIUserContext;
};

/**
 * Chat thread query builder.
 * @beta
 */
export class ChatThreadQuery implements IChatThreadQuery {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly config: ChatThreadQueryConfig,
    ) {}

    withSearchLimit(limitSearch: number): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, {
            ...this.config,
            limitSearch,
        });
    }

    withCreateLimit(limitCreate: number): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, {
            ...this.config,
            limitCreate,
        });
    }

    withUserContext(userContext: IGenAIUserContext): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, {
            ...this.config,
            userContext,
        });
    }

    async query(options?: { signal?: AbortSignal }): Promise<IGenAIChatEvaluation> {
        const response = await this.authCall((client) =>
            client.genAI.aiChat(
                {
                    workspaceId: this.config.workspaceId,
                    chatRequest: {
                        question: this.config.userQuestion,
                        limitSearch: this.config.limitSearch,
                        limitCreate: this.config.limitCreate,
                        userContext: this.config.userContext,
                    },
                },
                options,
            ),
        );

        return response.data as IGenAIChatEvaluation;
    }
}
