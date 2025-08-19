// (C) 2024-2025 GoodData Corporation

import { EventSourceMessage, EventSourceParserStream } from "eventsource-parser/stream";

import {
    IChatThread,
    IChatThreadHistory,
    IChatThreadQuery,
    IGenAIChatEvaluation,
} from "@gooddata/sdk-backend-spi";
import {
    GenAIChatInteractionUserFeedback,
    GenAIChatInteractionUserVisualisation,
    IGenAIUserContext,
} from "@gooddata/sdk-model";

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
        fromInteractionId?: string,
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

    async saveUserFeedback(
        chatHistoryInteractionId: string,
        userFeedback: GenAIChatInteractionUserFeedback,
    ): Promise<void> {
        await this.authCall((client) => {
            return client.genAI.aiChatHistory({
                workspaceId: this.workspaceId,
                chatHistoryRequest: {
                    chatHistoryInteractionId,
                    userFeedback,
                },
            });
        });
    }

    async saveUserVisualisation(
        chatHistoryInteractionId: string,
        savedVisualization: GenAIChatInteractionUserVisualisation,
    ): Promise<void> {
        await this.authCall((client) => {
            return client.genAI.aiChatHistory({
                workspaceId: this.workspaceId,
                chatHistoryRequest: {
                    chatHistoryInteractionId,
                    savedVisualization: {
                        createdVisualizationId: savedVisualization.createdId,
                        savedVisualizationId: savedVisualization.savedId,
                    },
                },
            });
        });
    }

    async saveRenderVisualisationStatus(
        chatHistoryInteractionId: string,
        responseState: "SUCCESSFUL" | "UNEXPECTED_ERROR" | "TOO_MANY_DATA_POINTS" | "NO_DATA" | "NO_RESULTS",
    ): Promise<void> {
        await this.authCall((client) => {
            return client.genAI.aiChatHistory({
                workspaceId: this.workspaceId,
                chatHistoryRequest: {
                    chatHistoryInteractionId,
                    responseState,
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

    stream(): ReadableStream<IGenAIChatEvaluation> {
        // We are using Axios <1.7, which does not support streaming,
        // as it can't use fetch API instead of XHR.
        // This method can be simplified once we upgrade to Axios >=1.7.
        const { authCall, config } = this;

        let lastLoaded = 0;
        // Generate a stream of string from server, as XHR delivers data in chunks.
        const textStream = new ReadableStream<string>({
            start(controller) {
                authCall((client) =>
                    client.genAI.aiChatStream(
                        {
                            workspaceId: config.workspaceId,
                            chatRequest: {
                                question: config.userQuestion,
                                limitSearch: config.limitSearch,
                                limitCreate: config.limitCreate,
                                userContext: config.userContext,
                            },
                        },
                        {
                            // Abort signal only affecting the request, as the stream is generally
                            // processed very quickly, and we don't care if an extra event slips through.
                            headers: {
                                Accept: "text/event-stream",
                            },
                            onDownloadProgress: (evt) => {
                                const data = evt.event.target.responseText.slice(lastLoaded);
                                lastLoaded += data.length;
                                controller.enqueue(data);
                            },
                        },
                    ),
                )
                    .catch((error) => {
                        controller.error(error);
                    })
                    .finally(() => {
                        controller.close();
                    });
            },
        });

        // Convert the text stream to a stream of server sent events using eventsource-parser lib.
        // and then to a stream of IGenAIChatEvaluation.
        return textStream
            .pipeThrough(new EventSourceParserStream())
            .pipeThrough(new ServerSentEventsDataParser());
    }
}

/**
 * A transform stream from SSE to IGenAIChatEvaluation
 * @internal
 */
class ServerSentEventsDataParser extends TransformStream<EventSourceMessage, IGenAIChatEvaluation> {
    constructor() {
        super({
            transform(event, controller) {
                if (event.event === "chat-message") {
                    controller.enqueue(JSON.parse(event.data));
                }
            },
        });
    }
}
