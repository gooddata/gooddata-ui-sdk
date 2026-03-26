// (C) 2024-2026 GoodData Corporation

import { type EventSourceMessage, EventSourceParserStream } from "eventsource-parser/stream";

import { type AiConversationItemResponseDto } from "@gooddata/api-client-tiger";
import {
    GenAiApi_DeleteConversation,
    GenAiApi_GetConversation,
    GenAiApi_GetConversationItems,
    GenAiApi_GetConversationResponses,
    GenAiApi_GetConversations,
    GenAiApi_PatchConversationResponse,
    GenAiApi_PatchVisualization,
    GenAiApi_PostConversations,
    GenAiApi_PostMessages,
} from "@gooddata/api-client-tiger/endpoints/genAI";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    type IChatConversation,
    type IChatConversationError,
    type IChatConversationItem,
    type IChatConversationItemsQuery,
    type IChatConversationItemsQueryResult,
    type IChatConversationThread,
    type IChatConversationThreadQuery,
    type IChatConversations,
} from "@gooddata/sdk-backend-spi";
import {
    type GenAIChatInteractionUserFeedback,
    type GenAIObjectType,
    type IAllowedRelationshipType,
    type IGenAIUserContext,
} from "@gooddata/sdk-model";

import { type FormattingLocale } from "../../../convertors/fromBackend/dateFormatting/defaultDateFormatter.js";
import type { DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import {
    convertChatConversationErrorFromBackend,
    convertChatConversationFromBackend,
    convertChatConversationItemFromBackend,
} from "../../../convertors/fromBackend/genAIConvertor.js";
import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Chat conversations service.
 * @beta
 */
export class ChatConversationsService implements IChatConversations {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
        private readonly dateNormalizer: DateNormalizer,
    ) {}

    getConversationItemsQuery(): IChatConversationItemsQuery {
        return new ConversationItemsQuery(this.authCall, this.workspaceId);
    }

    async create(): Promise<IChatConversation> {
        return await this.authCall(async (client) => {
            const response = await GenAiApi_PostConversations(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            });
            return convertChatConversationFromBackend(response.data);
        });
    }

    async delete(conversationId: string): Promise<void> {
        await this.authCall((client) => {
            return GenAiApi_DeleteConversation(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                conversationId,
            });
        });
    }

    async getConversation(conversationId: string): Promise<IChatConversation> {
        return await this.authCall(async (client) => {
            const response = await GenAiApi_GetConversation(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                conversationId,
            });
            return convertChatConversationFromBackend(response.data);
        });
    }

    getConversationThread(conversationId: string): IChatConversationThread {
        return new ConversationThread(
            this,
            this.authCall,
            this.workspaceId,
            this.dateNormalizer,
            conversationId,
        );
    }
}

/**
 * Conversation items query implementation.
 * @beta
 */
export class ConversationItemsQuery implements IChatConversationItemsQuery {
    private size = 50;
    private page = 0;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    withSize(size: number): IChatConversationItemsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IChatConversationItemsQuery {
        this.page = page;
        return this;
    }

    query(): Promise<IChatConversationItemsQueryResult> {
        return ServerPaging.for(
            async () => {
                const response = await this.authCall((client) => {
                    return GenAiApi_GetConversations(client.axios, client.basePath, {
                        workspaceId: this.workspaceId,
                    });
                });

                const items = response.data.map(convertChatConversationFromBackend);
                return { items, totalCount: items.length };
            },
            this.size,
            this.page * this.size,
        );
    }
}

/**
 * Conversation thread implementation.
 * @beta
 */
export class ConversationThread implements IChatConversationThread {
    constructor(
        private readonly service: ChatConversationsService,
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
        private readonly dateNormalizer: DateNormalizer,
        private conversationId: string | undefined,
    ) {}

    /**
     * Loads history of the conversation.
     */
    async loadHistory(options?: { signal?: AbortSignal }): Promise<IChatConversationItem[]> {
        const conversationId = this.conversationId;
        if (!conversationId) {
            throw new Error("Conversation ID is not set");
        }

        const items = await this.authCall((client) => {
            return GenAiApi_GetConversationItems(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspaceId,
                    conversationId,
                },
                options,
            );
        });
        const responses = await this.authCall((client) => {
            return GenAiApi_GetConversationResponses(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspaceId,
                    conversationId,
                },
                options,
            );
        });

        const data = items.data as { items: AiConversationItemResponseDto[] };
        return data.items.map((item) =>
            convertChatConversationItemFromBackend(item, responses?.data.responses),
        );
    }

    /**
     * Resets the conversation. This deletes all history and creates a new conversation.
     */
    async reset(): Promise<IChatConversation> {
        if (this.conversationId) {
            await this.service.delete(this.conversationId);
        }

        const conversations = await this.service.getConversationItemsQuery().withSize(1).query();
        if (conversations.items.length === 0) {
            const conv = await this.service.create();
            this.conversationId = conv.id;
            return conv;
        } else {
            this.conversationId = conversations.items[0].id;
            return conversations.items[0];
        }
    }

    /**
     * Saves feedback for the conversation item.
     */
    async saveFeedback(
        responseId: string,
        feedback: GenAIChatInteractionUserFeedback,
        userTextFeedback?: string,
    ): Promise<void> {
        const conversationId = this.conversationId;
        if (!conversationId) {
            throw new Error("Conversation ID is not set");
        }

        await this.authCall((client) => {
            return GenAiApi_PatchConversationResponse(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                conversationId,
                responseId,
                aiResponseFeedbackRequest: {
                    feedback:
                        feedback === "NONE"
                            ? null
                            : {
                                  type: feedback,
                                  text: userTextFeedback,
                              },
                },
            });
        });
    }

    /**
     * Saves visualization for the conversation item.
     */
    async resaveVisualisation(oldVisualizationId: string, newVisualizationId: string): Promise<void> {
        const conversationId = this.conversationId;
        if (!conversationId) {
            throw new Error("Conversation ID is not set");
        }

        await this.authCall((client) => {
            return GenAiApi_PatchVisualization(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                conversationId,
                visualizationId: oldVisualizationId,
                aiVisualizationIdUpdateRequest: {
                    id: newVisualizationId,
                },
            });
        });
    }

    /**
     * Queries the conversation thread.
     */
    query(userMessage: string): IChatConversationThreadQuery {
        const conversationId = this.conversationId;
        if (!conversationId) {
            throw new Error("Conversation ID is not set");
        }

        return new ChatConversationThreadQuery(this.authCall, this.dateNormalizer, {
            workspaceId: this.workspaceId,
            userQuestion: userMessage,
            conversationId,
        });
    }
}

/**
 * Chat thread query configuration.
 * @internal
 */
export type ChatConversationThreadQueryConfig = {
    workspaceId: string;
    conversationId: string;
    userQuestion: string;
    limitSearch?: number;
    limitCreate?: number;
    userContext?: IGenAIUserContext;
    objectTypes?: GenAIObjectType[];
    allowedRelationshipTypes?: IAllowedRelationshipType[];
};

/**
 * Chat conversation thread query implementation.
 * @internal
 */
export class ChatConversationThreadQuery implements IChatConversationThreadQuery {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly dateNormalizer: DateNormalizer,
        private readonly requestParameters: ChatConversationThreadQueryConfig,
    ) {}

    withSearchLimit(searchLimit: number): IChatConversationThreadQuery {
        return new ChatConversationThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.requestParameters,
            limitSearch: searchLimit,
        });
    }
    withCreateLimit(createLimit: number): IChatConversationThreadQuery {
        return new ChatConversationThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.requestParameters,
            limitCreate: createLimit,
        });
    }
    withUserContext(userContext: IGenAIUserContext): IChatConversationThreadQuery {
        return new ChatConversationThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.requestParameters,
            userContext,
        });
    }
    withObjectTypes(objectTypes?: GenAIObjectType[]): IChatConversationThreadQuery {
        return new ChatConversationThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.requestParameters,
            objectTypes,
        });
    }
    withAllowedRelationshipTypes(
        relationshipTypes?: IAllowedRelationshipType[],
    ): IChatConversationThreadQuery {
        return new ChatConversationThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.requestParameters,
            allowedRelationshipTypes: relationshipTypes,
        });
    }
    async query(options?: { signal?: AbortSignal }): Promise<IChatConversationItem[]> {
        const response = await this.authCall((client) => {
            return GenAiApi_PostMessages(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.requestParameters.workspaceId,
                    conversationId: this.requestParameters.conversationId,
                    aiSendMessageRequest: {
                        item: {
                            role: "user",
                            content: {
                                type: "text",
                                text: this.requestParameters.userQuestion,
                            },
                        },
                        options: {
                            search: {
                                objectTypes: this.requestParameters.objectTypes,
                                searchLimit: this.requestParameters.limitSearch,
                                allowedRelationshipTypes: this.requestParameters.allowedRelationshipTypes,
                            },
                        },
                    },
                },
                options,
            );
        });
        const data = response.data as { items: AiConversationItemResponseDto[] };
        return data.items.map((item) => convertChatConversationItemFromBackend(item, undefined));
    }
    stream(): ReadableStream<IChatConversationItem | IChatConversationError> {
        // We are using Axios <1.7, which does not support streaming,
        // as it can't use fetch API instead of XHR.
        // This method can be simplified once we upgrade to Axios >=1.7.
        const { authCall, requestParameters } = this;

        let lastLoaded = 0;
        // Generate a stream of string from server, as XHR delivers data in chunks.
        const textStream = new ReadableStream<string>({
            start(controller) {
                authCall((client) => {
                    return GenAiApi_PostMessages(
                        client.axios,
                        client.basePath,
                        {
                            workspaceId: requestParameters.workspaceId,
                            conversationId: requestParameters.conversationId,
                            aiSendMessageRequest: {
                                item: {
                                    role: "user",
                                    content: {
                                        type: "text",
                                        text: requestParameters.userQuestion,
                                    },
                                },
                                options: {
                                    search: {
                                        objectTypes: requestParameters.objectTypes,
                                        searchLimit: requestParameters.limitSearch,
                                        allowedRelationshipTypes: requestParameters.allowedRelationshipTypes,
                                    },
                                },
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
                    );
                })
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
            .pipeThrough(new ServerSentEventsDataConverter(this.dateNormalizer));
    }
}

/**
 * A transform stream from SSE to IGenAIChatEvaluation
 * @internal
 */
class ServerSentEventsDataParser extends TransformStream<
    EventSourceMessage,
    { type: "item" | "error" | "response_ended"; data: object }
> {
    constructor() {
        super({
            transform(event, controller) {
                if (event.event === "item" || event.event === "error" || event.event === "response_ended") {
                    controller.enqueue({
                        type: event.event,
                        data: JSON.parse(event.data),
                    });
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
    { type: "item" | "error" | "response_ended"; data: object },
    IChatConversationItem | IChatConversationError
> {
    constructor(_dateNormalizer: DateNormalizer, _locale?: FormattingLocale, _timezone?: string) {
        super({
            transform(event, controller) {
                if (event.type === "error") {
                    controller.enqueue(convertChatConversationErrorFromBackend(event.data));
                } else if (event.type === "item" && "item" in event.data) {
                    controller.enqueue(
                        convertChatConversationItemFromBackend(
                            event.data.item as AiConversationItemResponseDto,
                            undefined,
                        ),
                    );
                }
            },
        });
    }
}
