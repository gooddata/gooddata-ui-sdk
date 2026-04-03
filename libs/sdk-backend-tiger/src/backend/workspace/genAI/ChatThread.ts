// (C) 2024-2026 GoodData Corporation

import { type EventSourceMessage, EventSourceParserStream } from "eventsource-parser/stream";

import type {
    ChatHistoryInteraction,
    ChatHistoryResult,
    CreatedVisualization,
    SearchRelationshipObject,
    SearchResult,
    SearchResultObject,
    UserContext,
} from "@gooddata/api-client-tiger";
import {
    GenAiApi_AiChat,
    GenAiApi_AiChatHistory,
    GenAiApi_AiChatStream,
} from "@gooddata/api-client-tiger/endpoints/genAI";
import type {
    IChatThread,
    IChatThreadHistory,
    IChatThreadQuery,
    IGenAIChatEvaluation,
} from "@gooddata/sdk-backend-spi";
import {
    type GenAIChatInteractionUserFeedback,
    type GenAIChatInteractionUserVisualisation,
    type GenAIFilter,
    type GenAIMetricType,
    type GenAIObjectType,
    type GenAIVisualizationType,
    type IAllowedRelationshipType,
    type IGenAIChangeAnalysisParams,
    type IGenAIChatInteraction,
    type IGenAIChatRouting,
    type IGenAICreatedVisualizations,
    type IGenAIFoundObjects,
    type IGenAIUserContext,
    type IGenAIVisualization,
    type ISemanticSearchRelationship,
    type ISemanticSearchResult,
    type ISemanticSearchResultItem,
    objRefToString,
} from "@gooddata/sdk-model";

import { convertFilter } from "../../../convertors/fromBackend/afm/FilterConverter.js";
import { convertMeasure } from "../../../convertors/fromBackend/afm/MeasureConverter.js";
import { convertAttribute } from "../../../convertors/fromBackend/AttributeConvertor.js";
import { type FormattingLocale } from "../../../convertors/fromBackend/dateFormatting/defaultDateFormatter.js";
import { type DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { getFormatByGranularity } from "../../../utils/dateUtils.js";

/**
 * Chat thread service.
 * @beta
 */
export class ChatThreadService implements IChatThread {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
        private readonly dateNormalizer: DateNormalizer,
    ) {}

    async loadHistory(
        fromInteractionId?: string,
        options?: { signal?: AbortSignal },
    ): Promise<IChatThreadHistory> {
        const response = await this.authCall((client) => {
            return GenAiApi_AiChatHistory(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspaceId,
                    chatHistoryRequest: {
                        chatHistoryInteractionId: fromInteractionId,
                    },
                },
                options,
            );
        });

        return convertChatHistoryResult(this.dateNormalizer, response.data);
    }

    async reset(): Promise<void> {
        await this.authCall((client) => {
            return GenAiApi_AiChatHistory(client.axios, client.basePath, {
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
        userTextFeedback?: string,
    ): Promise<void> {
        await this.authCall((client) => {
            return GenAiApi_AiChatHistory(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                chatHistoryRequest: {
                    chatHistoryInteractionId,
                    userFeedback,
                    userTextFeedback,
                },
            });
        });
    }

    async saveUserVisualisation(
        chatHistoryInteractionId: string,
        savedVisualization: GenAIChatInteractionUserVisualisation,
    ): Promise<void> {
        await this.authCall((client) => {
            return GenAiApi_AiChatHistory(client.axios, client.basePath, {
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
            return GenAiApi_AiChatHistory(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                chatHistoryRequest: {
                    chatHistoryInteractionId,
                    responseState,
                },
            });
        });
    }

    query(userMessage: string): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, this.dateNormalizer, {
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
    objectTypes?: GenAIObjectType[];
    allowedRelationshipTypes?: IAllowedRelationshipType[];
};

/**
 * Chat thread query builder.
 * @beta
 */
export class ChatThreadQuery implements IChatThreadQuery {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly dateNormalizer: DateNormalizer,
        private readonly config: ChatThreadQueryConfig,
    ) {}

    withSearchLimit(limitSearch: number): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.config,
            limitSearch,
        });
    }

    withCreateLimit(limitCreate: number): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.config,
            limitCreate,
        });
    }

    withUserContext(userContext: IGenAIUserContext): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.config,
            userContext,
        });
    }

    withObjectTypes(objectTypes?: GenAIObjectType[]): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.config,
            objectTypes,
        });
    }

    withAllowedRelationshipTypes(allowedRelationshipTypes?: IAllowedRelationshipType[]): IChatThreadQuery {
        return new ChatThreadQuery(this.authCall, this.dateNormalizer, {
            ...this.config,
            allowedRelationshipTypes,
        });
    }

    async query(options?: { signal?: AbortSignal }): Promise<IGenAIChatEvaluation> {
        const response = await this.authCall((client) =>
            GenAiApi_AiChat(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.config.workspaceId,
                    chatRequest: {
                        question: this.config.userQuestion,
                        limitSearch: this.config.limitSearch,
                        limitCreate: this.config.limitCreate,
                        userContext: convertUserContext(this.config.userContext),
                        objectTypes: this.config.objectTypes,
                        allowedRelationshipTypes: this.config.allowedRelationshipTypes,
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
                    GenAiApi_AiChatStream(
                        client.axios,
                        client.basePath,
                        {
                            workspaceId: config.workspaceId,
                            chatRequest: {
                                question: config.userQuestion,
                                limitSearch: config.limitSearch,
                                limitCreate: config.limitCreate,
                                userContext: convertUserContext(config.userContext),
                                objectTypes: config.objectTypes,
                                allowedRelationshipTypes: config.allowedRelationshipTypes,
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
                    .then(() => {
                        // Signal end-of-stream to consumers once the request completes successfully.
                        controller.close();
                    })
                    .catch((error) => {
                        // Signal an error to consumers. This terminates the stream — calling
                        // close() afterwards is illegal (ReadableStream spec) and was previously
                        // triggered by using .finally() which runs after both success and failure.
                        controller.error(error);
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
    constructor(dateNormalizer: DateNormalizer, locale?: FormattingLocale, timezone?: string) {
        super({
            transform(event, controller) {
                controller.enqueue(convertChatEvaluation(dateNormalizer, event, locale, timezone));
            },
        });
    }
}

function convertChatHistoryResult(
    dateNormalizer: DateNormalizer,
    data: ChatHistoryResult,
    locale?: FormattingLocale,
    timezone?: string,
): IChatThreadHistory {
    return {
        ...data,
        interactions: data.interactions.map((i) =>
            convertChatHistoryInteraction(dateNormalizer, i, locale, timezone),
        ),
    };
}

function convertChatHistoryInteraction(
    dateNormalizer: DateNormalizer,
    data: ChatHistoryInteraction,
    locale?: FormattingLocale,
    timezone?: string,
): IGenAIChatInteraction {
    return {
        question: data.question,
        chatHistoryInteractionId: data.chatHistoryInteractionId,
        interactionFinished: data.interactionFinished,
        textResponse: data.textResponse,
        userFeedback: data.userFeedback,
        errorResponse: data.errorResponse,
        routing: convertRouting(data.routing),
        ...(data.reasoning
            ? {
                  reasoning: data.reasoning,
              }
            : {}),
        ...(data.foundObjects
            ? {
                  foundObjects: convertFoundObjects(data.foundObjects),
              }
            : {}),
        ...(data.semanticSearch
            ? {
                  semanticSearch: convertSemanticSearch(data.semanticSearch),
              }
            : {}),
        ...(data.createdVisualizations
            ? {
                  createdVisualizations: convertCreatedVisualizations(data.createdVisualizations),
              }
            : {}),
        ...(data.changeAnalysisParams
            ? {
                  changeAnalysisParams: convertChangeAnalysisParams(
                      dateNormalizer,
                      data.changeAnalysisParams,
                      locale,
                      timezone,
                  ),
              }
            : {}),
    };
}

function convertChatEvaluation(
    dateNormalizer: DateNormalizer,
    data: Partial<ChatHistoryInteraction>,
    locale?: FormattingLocale,
    timezone?: string,
): IGenAIChatEvaluation {
    return {
        ...(data.routing
            ? {
                  routing: convertRouting(data.routing),
              }
            : {}),
        ...(data.reasoning
            ? {
                  reasoning: data.reasoning,
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
        ...(data.semanticSearch
            ? {
                  semanticSearch: convertSemanticSearch(data.semanticSearch),
              }
            : {}),
        ...(data.createdVisualizations
            ? {
                  createdVisualizations: convertCreatedVisualizations(data.createdVisualizations),
              }
            : {}),
        ...(data.changeAnalysisParams
            ? {
                  changeAnalysisParams: convertChangeAnalysisParams(
                      dateNormalizer,
                      data.changeAnalysisParams,
                      locale,
                      timezone,
                  ),
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
        objects: data.objects?.map(convertSemanticSearchResultItem) ?? [],
    };
}

function convertSemanticSearch(data: SearchResult): ISemanticSearchResult {
    return {
        reasoning: data.reasoning,
        results: data.results?.map(convertSemanticSearchResultItem) ?? [],
        relationships: data.relationships?.map(convertSemanticSearchRelationship) ?? [],
    };
}

function convertSemanticSearchResultItem(data: SearchResultObject): ISemanticSearchResultItem {
    return {
        ...data,
        type: data.type as GenAIObjectType,
    };
}

function convertSemanticSearchRelationship(data: SearchRelationshipObject): ISemanticSearchRelationship {
    return {
        sourceWorkspaceId: data.sourceWorkspaceId,
        sourceObjectId: data.sourceObjectId,
        sourceObjectType: data.sourceObjectType as GenAIObjectType,
        sourceObjectTitle: data.sourceObjectTitle,
        targetWorkspaceId: data.targetWorkspaceId,
        targetObjectId: data.targetObjectId,
        targetObjectType: data.targetObjectType as GenAIObjectType,
        targetObjectTitle: data.targetObjectTitle,
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

export function convertCreatedVisualization(data: CreatedVisualization): IGenAIVisualization {
    const config: IGenAIVisualization["config"] = {};
    if (data.config?.forecast) {
        config.forecast = {
            forecastPeriod: data.config.forecast.forecastPeriod,
            confidenceLevel: data.config.forecast.confidenceLevel,
            seasonal: data.config.forecast.seasonal,
        };
    }
    if (data.config?.anomalyDetection) {
        config.anomalyDetection = {
            sensitivity: data.config.anomalyDetection.sensitivity,
        };
    }
    if (data.config?.clustering) {
        config.clustering = {
            numberOfClusters: data.config.clustering.numberOfClusters,
            threshold: data.config.clustering.threshold,
        };
    }
    if (data.config?.whatIf) {
        config.whatIf = {
            scenarios: data.config.whatIf.scenarios.map((scenario) => ({
                label: scenario.label,
                adjustments: scenario.adjustments.map((adj) => ({
                    metricId: adj.metricId,
                    metricType: adj.metricType as GenAIMetricType,
                    scenarioMaql: adj.scenarioMaql,
                })),
            })),
            includeBaseline: data.config.whatIf.includeBaseline,
        };
    }

    return {
        id: data.id,
        title: data.title,
        visualizationType: data.visualizationType as GenAIVisualizationType,
        metrics: data.metrics,
        dimensionality: data.dimensionality,
        filters: data.filters as GenAIFilter[],
        suggestions: data.suggestions,
        savedVisualizationId: data.savedVisualizationId,
        ...(Object.keys(config).length > 0 ? { config } : {}),
    };
}

function convertChangeAnalysisParams(
    dateNormalizer: DateNormalizer,
    data: Required<ChatHistoryInteraction>["changeAnalysisParams"],
    locale?: FormattingLocale,
    timezone?: string,
): IGenAIChangeAnalysisParams {
    const measure = convertMeasure(data.measure);
    measure.measure.title = data.measureTitle;

    const dateAttribute = convertAttribute(data.dateAttribute);
    const dateGranularity = getFormatByGranularity(dateAttribute);

    return {
        ...data,
        measure,
        dateAttribute,
        dateGranularity,
        normalizedAnalyzedPeriod: dateNormalizer(data.analyzedPeriod, dateGranularity, locale, timezone),
        normalizedReferencePeriod: dateNormalizer(data.referencePeriod, dateGranularity, locale, timezone),
        attributes: data.attributes?.map(convertAttribute) ?? [],
        filters: data.filters?.map(convertFilter) ?? [],
    };
}

/**
 * Convert SDK model user context (with ObjRef) to the API user context (with plain string IDs).
 */
function convertUserContext(userContext: IGenAIUserContext | undefined): UserContext | undefined {
    if (!userContext) {
        return undefined;
    }

    return {
        ...(userContext.activeObject
            ? {
                  activeObject: {
                      id: objRefToString(userContext.activeObject.ref),
                      type: userContext.activeObject.type,
                      workspaceId: userContext.activeObject.workspaceId,
                  },
              }
            : {}),
        ...(userContext.view?.dashboard
            ? {
                  view: {
                      dashboard: {
                          id: objRefToString(userContext.view.dashboard.ref),
                          widgets: userContext.view.dashboard.widgets.map((w) => ({
                              title: w.title,
                              widgetId: objRefToString(w.widgetRef),
                              widgetType: w.widgetType,
                              ...(w.insightRef ? { visualizationId: objRefToString(w.insightRef) } : {}),
                              ...(w.resultId ? { resultId: w.resultId } : {}),
                          })),
                      },
                  },
              }
            : {}),
        ...(userContext.referencedObjects
            ? {
                  referencedObjects: userContext.referencedObjects.map((group) => ({
                      ...(group.context
                          ? {
                                context: {
                                    type: group.context.type,
                                    id: objRefToString(group.context.ref),
                                },
                            }
                          : {}),
                      objects: group.objects.map((o) => ({
                          type: o.type,
                          id: objRefToString(o.ref),
                      })),
                  })),
              }
            : {}),
    };
}
