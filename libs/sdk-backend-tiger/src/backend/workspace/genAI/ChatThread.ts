// (C) 2024-2025 GoodData Corporation

import { EventSourceMessage, EventSourceParserStream } from "eventsource-parser/stream";

import {
    ChatHistoryInteraction,
    ChatHistoryResult,
    CreatedVisualization,
    SearchResultObject,
} from "@gooddata/api-client-tiger";
import {
    IChatThread,
    IChatThreadHistory,
    IChatThreadQuery,
    IGenAIChatEvaluation,
} from "@gooddata/sdk-backend-spi";
import {
    GenAIChatInteractionUserFeedback,
    GenAIChatInteractionUserVisualisation,
    GenAIFilter,
    GenAIObjectType,
    IGenAIChangeAnalysisParams,
    IGenAIChatInteraction,
    IGenAIChatRouting,
    IGenAICreatedVisualizations,
    IGenAIFoundObjects,
    IGenAIUserContext,
    IGenAIVisualization,
    ISemanticSearchResultItem,
} from "@gooddata/sdk-model";

import { convertFilter } from "../../../convertors/fromBackend/afm/FilterConverter.js";
import { convertMeasure } from "../../../convertors/fromBackend/afm/MeasureConverter.js";
import { convertAttribute } from "../../../convertors/fromBackend/AttributeConvertor.js";
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

        return convertChatHistoryResult(response.data);
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
            .pipeThrough(new ServerSentEventsDataParser())
            .pipeThrough(new ServerSentEventsDataConverter());
    }
}

/**
 * A transform stream from SSE to IGenAIChatEvaluation
 * @internal
 */
class ServerSentEventsDataParser extends TransformStream<
    EventSourceMessage,
    Partial<ChatHistoryInteraction>
> {
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

/**
 * A transform stream from SSE to IGenAIChatEvaluation
 * @internal
 */
class ServerSentEventsDataConverter extends TransformStream<
    Partial<ChatHistoryInteraction>,
    IGenAIChatEvaluation
> {
    constructor() {
        super({
            transform(event, controller) {
                controller.enqueue(convertChatEvaluation(event));
            },
        });
    }
}

function convertChatHistoryResult(data: ChatHistoryResult): IChatThreadHistory {
    return {
        ...data,
        interactions: data.interactions.map(convertChatHistoryInteraction),
    };
}

function convertChatHistoryInteraction(data: ChatHistoryInteraction): IGenAIChatInteraction {
    return {
        question: data.question,
        chatHistoryInteractionId: data.chatHistoryInteractionId,
        interactionFinished: data.interactionFinished,
        textResponse: data.textResponse,
        userFeedback: data.userFeedback,
        errorResponse: data.errorResponse,
        routing: convertRouting(data.routing),
        ...(data.foundObjects
            ? {
                  foundObjects: convertFoundObjects(data.foundObjects),
              }
            : {}),
        ...(data.createdVisualizations
            ? {
                  createdVisualizations: convertCreatedVisualizations(data.createdVisualizations),
              }
            : {}),
        ...(data.changeAnalysisParams
            ? {
                  changeAnalysisParams: convertChangeAnalysisParams(data.changeAnalysisParams),
              }
            : {}),
    };
}

function convertChatEvaluation(data: Partial<ChatHistoryInteraction>): IGenAIChatEvaluation {
    return {
        ...(data.routing
            ? {
                  routing: convertRouting(data.routing),
              }
            : {}),
        ...(data.question
            ? {
                  question: data.question,
              }
            : {}),
        ...(data.textResponse
            ? {
                  textResponse: data.textResponse,
              }
            : {}),
        ...(data.foundObjects
            ? {
                  foundObjects: convertFoundObjects(data.foundObjects),
              }
            : {}),
        ...(data.createdVisualizations
            ? {
                  createdVisualizations: convertCreatedVisualizations(data.createdVisualizations),
              }
            : {}),
        ...(data.changeAnalysisParams
            ? {
                  changeAnalysisParams: convertChangeAnalysisParams(data.changeAnalysisParams),
              }
            : {}),
        ...(data.errorResponse
            ? {
                  errorResponse: data.errorResponse,
              }
            : {}),
        ...(data.chatHistoryInteractionId
            ? {
                  chatHistoryInteractionId: data.chatHistoryInteractionId,
              }
            : {}),
        ...(data.userFeedback
            ? {
                  userFeedback: data.userFeedback,
              }
            : {}),
    };
}

function convertRouting(data: ChatHistoryInteraction["routing"]): IGenAIChatRouting {
    return {
        ...data,
    };
}

function convertFoundObjects(data: Required<ChatHistoryInteraction>["foundObjects"]): IGenAIFoundObjects {
    return {
        reasoning: data.reasoning,
        objects: data.objects?.map(convertFoundObject) ?? [],
    };
}

function convertFoundObject(data: SearchResultObject): ISemanticSearchResultItem {
    return {
        ...data,
        type: data.type as GenAIObjectType,
    };
}

function convertCreatedVisualizations(
    data: Required<ChatHistoryInteraction>["createdVisualizations"],
): IGenAICreatedVisualizations {
    return {
        objects: data.objects?.map(convertCreatedVisualization) ?? [],
        reasoning: data.reasoning,
        suggestions: data.suggestions,
    };
}

function convertCreatedVisualization(data: CreatedVisualization): IGenAIVisualization {
    return {
        ...data,
        filters: data.filters.map((f) => {
            return f as GenAIFilter;
        }),
    };
}

function convertChangeAnalysisParams(
    data: Required<ChatHistoryInteraction>["changeAnalysisParams"],
): IGenAIChangeAnalysisParams {
    return {
        ...data,
        measure: convertMeasure(data.measure),
        dateAttribute: convertAttribute(data.dateAttribute),
        attributes: data.attributes?.map(convertAttribute) ?? [],
        filters: data.filters?.map(convertFilter) ?? [],
    };
}
