// (C) 2024-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import {
    type AiContent,
    type AiConversationItemResponse,
    type AiConversationResponse,
    type AiConversationResponseList,
    type AiConversationTurnResponse,
    type AiKeyDriverAnalysis,
    type AiSearchObject,
    type AiSearchRelationship,
    type AiWhatIfScenario,
} from "@gooddata/api-client-tiger";
import {
    type IChatConversation,
    type IChatConversationContent,
    type IChatConversationError,
    type IChatConversationFeedback,
    type IChatConversationItem,
    type IChatKdaDefinition,
    type IChatSuggestionsItem,
    type IChatWhatIfDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    type AacFilter,
    type AacVisualisation,
    yamlFiltersToDeclarative,
    yamlVisualisationToMetadataObject,
} from "@gooddata/sdk-code-convertors";
import {
    type GenAIObjectType,
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
    type ObjectType,
    assertNever,
} from "@gooddata/sdk-model";

import { getFormatByGranularity } from "../../utils/dateUtils.js";
import { convertMeasure } from "./afm/MeasureConverter.js";
import { convertAttribute } from "./AttributeConvertor.js";
import type { FormattingLocale } from "./dateFormatting/defaultDateFormatter.js";
import { type DateNormalizer } from "./dateFormatting/types.js";
import { visualizationObjectsItemToInsight } from "./InsightConverter.js";

export function convertChatConversationFromBackend(conversation: AiConversationResponse): IChatConversation {
    return {
        id: conversation.conversationId,
        createdAt: conversation.createdAt,
        updatedAt: conversation.lastActivityAt,
        title: conversation.title ?? undefined,
    };
}

export function convertChatConversationItemFromBackend(
    item: AiConversationItemResponse,
    responses: AiConversationResponseList["responses"] | undefined,
    dateNormalizer: DateNormalizer,
    locale?: FormattingLocale,
    timezone?: string,
): IChatConversationItem {
    const response = responses?.find((r) => r.responseId === item.responseId);

    return {
        type: "item",
        id: item.itemId,
        role: item.role,
        responseId: item.responseId ?? "",
        replyTo: item.replyTo ?? undefined,
        createdAt: new Date(item.createdAt).getTime(),
        feedback: convertChatConversationFeedbackFromBackend(response),
        content: convertChatConversationContentFromBackend(item.content, dateNormalizer, locale, timezone),
    };
}

function convertChatConversationFeedbackFromBackend(
    response: AiConversationTurnResponse | undefined,
): IChatConversationFeedback | undefined {
    if (!response?.feedback) {
        return undefined;
    }
    return {
        type: "feedback",
        feedback: response.feedback.type,
        text: response.feedback.text ?? undefined,
        createdAt: new Date(response.createdAt).getTime(),
        updatedAt: new Date(response.updatedAt).getTime(),
    };
}

function convertChatConversationContentFromBackend(
    content: AiContent,
    dateNormalizer: DateNormalizer,
    locale?: FormattingLocale,
    timezone?: string,
): IChatConversationContent {
    switch (content.type) {
        case "text":
            return {
                type: "text",
                text: content.text,
            };
        case "reasoning":
            return {
                type: "reasoning",
                summary: content.summary,
            };
        case "multipart":
            return {
                type: "multipart",
                parts: content.parts.map((part) => {
                    switch (part.type) {
                        case "text":
                            return {
                                type: "text",
                                text: part.text,
                            };
                        case "visualization":
                            return {
                                type: "visualization",
                                visualization: visualizationObjectsItemToInsight(
                                    yamlVisualisationToMetadataObject(
                                        [],
                                        part.visualization as AacVisualisation,
                                    ),
                                ),
                            };
                        case "kda":
                            return {
                                type: "kda",
                                kda: convertKda(
                                    part.kda as AiKeyDriverAnalysis,
                                    dateNormalizer,
                                    locale,
                                    timezone,
                                ),
                            };
                        case "whatIf":
                            return {
                                type: "whatIf",
                                whatIf: convertWhatIf(part.whatIf as AiWhatIfScenario),
                            };
                        case "searchResults":
                            return {
                                type: "searchResults",
                                keywords: part.keywords,
                                searchResults: convertSearchResults(part.objects),
                                relationships: convertSearchRelationships(part.relationships),
                            };
                        default:
                            assertNever(part);
                            throw new Error(`Unexpected part: ${JSON.stringify(part)}`);
                    }
                }),
            };
        case "toolCall":
            return {
                type: "toolCall",
                id: content.id,
                callId: content.callId,
                name: content.name,
                arguments: content.arguments,
            };
        case "toolResult":
            return {
                type: "toolResult",
                callId: content.callId,
                result: content.result,
            };
        default:
            assertNever(content);
            throw new Error(`Unexpected content: ${JSON.stringify(content)}`);
    }
}

export function convertChatConversationErrorFromBackend(
    item: Partial<{ statusCode: number; detail: string; reason: string }>,
    traceId?: string,
): IChatConversationError {
    return {
        type: "error",
        code: item.statusCode ?? 500,
        message: item.detail ?? "Unknown error",
        reason: item.reason,
        traceId,
    };
}

function convertKda(
    kda: AiKeyDriverAnalysis,
    dateNormalizer: DateNormalizer,
    locale?: FormattingLocale,
    timezone?: string,
): IChatKdaDefinition {
    const dateAttribute = convertAttribute({
        localIdentifier: uuidv4(),
        label: {
            identifier: {
                id: kda.dateAttributeId,
                type: "label",
            },
        },
    });
    const dateGranularity = getFormatByGranularity(dateAttribute);

    return {
        dateAttribute,
        dateGranularity,
        measure: convertMeasure({
            localIdentifier: uuidv4(),
            definition: {
                measure: {
                    item: { identifier: { id: kda.measure.id, type: kda.measure.type } },
                    aggregation: kda.measure.aggregation ?? undefined,
                },
            },
        }),
        analyzedPeriod: dateNormalizer(kda.analyzedPeriod, dateGranularity, locale, timezone),
        referencePeriod: dateNormalizer(kda.referencePeriod, dateGranularity, locale, timezone),
        filters: yamlFiltersToDeclarative([], kda.filters as AacFilter[], {}).filters,
    };
}

function convertWhatIf(whatIf: AiWhatIfScenario): IChatWhatIfDefinition {
    return {
        includeBaseline: whatIf.includeBaseline,
        scenarios: whatIf.scenarios.map((s) => {
            return {
                label: s.label,
                adjustments: s.adjustments.map((a) => ({
                    scenarioMaql: a.scenarioMaql,
                    ref: {
                        identifier: a.metricId,
                        type: (a.metricType === "metric" ? "measure" : a.metricType) as ObjectType,
                    },
                })),
            };
        }),
    };
}

function convertSearchResults(results: AiSearchObject[]): ISemanticSearchResultItem[] {
    return results.map((result) => ({
        id: result.id,
        type: result.type as GenAIObjectType,
        workspaceId: result.workspaceId,
        title: result.title,
        description: result.description ?? "",
        tags: result.tags ?? undefined,
        createdAt: result.createdAt ?? undefined,
        modifiedAt: result.modifiedAt ?? undefined,
        visualizationUrl: result.visualizationUrl ?? undefined,
        score: result.score,
    }));
}

function convertSearchRelationships(
    relationships: AiSearchRelationship[] | null | undefined,
): ISemanticSearchRelationship[] {
    return (
        relationships?.map((result) => ({
            sourceWorkspaceId: result.sourceWorkspaceId,
            sourceObjectId: result.sourceId,
            sourceObjectType: result.sourceType as GenAIObjectType,
            sourceObjectTitle: result.sourceTitle,
            targetWorkspaceId: result.targetWorkspaceId,
            targetObjectId: result.targetId,
            targetObjectType: result.targetType as GenAIObjectType,
            targetObjectTitle: result.targetTitle,
        })) ?? []
    );
}

/**
 * Represents AI-generated suggestions, which may include a follow-up question
 * and a list of actions with associated labels and queries.
 *
 * TODO: This is mock types, must be loaded from openapi when will be ready
 */
export type AiSuggestions = {
    followUpQuestion?: string;
    actions?: {
        label: string;
        query: string;
    }[];
};

export function convertChatSuggestionItemFromBackend(item: AiSuggestions | undefined): IChatSuggestionsItem {
    return {
        type: "suggestions",
        followUp: item?.followUpQuestion,
        actions: item?.actions?.map((action) => ({
            label: action.label,
            query: action.query,
        })),
    };
}
