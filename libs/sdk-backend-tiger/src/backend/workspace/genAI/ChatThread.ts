// (C) 2024 GoodData Corporation

import { IChatThread } from "@gooddata/sdk-backend-spi";
import { IGenAIChatEvaluation, IGenAIChatInteraction, IGenAIUserContext } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

type ChatThreadConfig = {
    question: string;
    searchLimit?: number;
    createLimit?: number;
    userContext?: IGenAIUserContext;
    chatHistory?: IGenAIChatInteraction[];
};

const defaultConfig: ChatThreadConfig = {
    question: "",
};

export class ChatThread implements IChatThread {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
        private readonly config: ChatThreadConfig = { ...defaultConfig },
    ) {}

    withQuestion(question: string): IChatThread {
        return new ChatThread(this.authCall, this.workspaceId, {
            ...this.config,
            question,
        });
    }

    withSearchLimit(searchLimit: number): IChatThread {
        return new ChatThread(this.authCall, this.workspaceId, {
            ...this.config,
            searchLimit,
        });
    }

    withCreateLimit(createLimit: number): IChatThread {
        return new ChatThread(this.authCall, this.workspaceId, {
            ...this.config,
            createLimit,
        });
    }

    withUserContext(userContext: IGenAIUserContext): IChatThread {
        return new ChatThread(this.authCall, this.workspaceId, {
            ...this.config,
            userContext,
        });
    }

    withChatHistory(chatHistory: IGenAIChatInteraction[]): IChatThread {
        return new ChatThread(this.authCall, this.workspaceId, {
            ...this.config,
            chatHistory,
        });
    }

    async query(options?: { signal?: AbortSignal }): Promise<IGenAIChatEvaluation> {
        const response = await this.authCall((client) =>
            client.genAI.aiChat(
                {
                    workspaceId: this.workspaceId,
                    chatRequest: this.config,
                },
                options,
            ),
        );

        // Casting because api-client has loose typing for object type
        return response.data as IGenAIChatEvaluation;
    }
}
