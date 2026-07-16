// (C) 2024-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import {
    type AiAlertProposal,
    type AiContent,
    type AiConversationItemResponse,
    type AiConversationResponse,
    type AiConversationResponseList,
    type AiConversationTurnResponse,
    type AiKeyDriverAnalysis,
    type AiSearchObject,
    type AiSearchRelationship,
    type AiSuggestions,
    type AiWhatIfScenario,
} from "@gooddata/api-client-tiger";
import {
    type IAlertProposal,
    type IChatConversation,
    type IChatConversationContent,
    type IChatConversationError,
    type IChatConversationFeedback,
    type IChatConversationItem,
    type IChatKdaDefinition,
    type IChatSuggestions,
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
    type IAutomationUserRecipient,
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
    type IdentifierRef,
    type ObjectType,
    assertNever,
} from "@gooddata/sdk-model";

import { getFormatByGranularity } from "../../utils/dateUtils.js";

import { convertMeasure } from "./afm/MeasureConverter.js";
import { convertAttribute } from "./AttributeConvertor.js";
import { convertAlert } from "./AutomationConverter.js";
import type { FormattingLocale } from "./dateFormatting/defaultDateFormatter.js";
import { type DateNormalizer } from "./dateFormatting/types.js";
import { cloneWithSanitizedIds } from "./IdSanitization.js";
import { visualizationObjectsItemToInsight } from "./InsightConverter.js";

export function convertChatConversationFromBackend(conversation: AiConversationResponse): IChatConversation {
    return {
        id: conversation.conversationId,
        createdAt: conversation.createdAt,
        updatedAt: conversation.lastActivityAt,
        title: conversation.title ?? undefined,
        pinned: conversation.pinned,
        agentId: conversation.agentId ?? undefined,
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
        agentId: item.newAgentId ?? undefined,
        oldAgentId: item.oldAgentId ?? undefined,
    };
}

export function convertChatConversationItemsFromBackend(
    items: AiConversationItemResponse[],
    responses: AiConversationResponseList["responses"] | undefined,
    dateNormalizer: DateNormalizer,
    locale?: FormattingLocale,
    timezone?: string,
): IChatConversationItem[] {
    return items.map((item) =>
        convertChatConversationItemFromBackend(item, responses, dateNormalizer, locale, timezone),
    );
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
                        case "alertProposal":
                            return {
                                type: "alertProposal",
                                alertProposal: convertAlertProposalFrom(part.alertProposal),
                            };
                        case "visualization":
                            return {
                                type: "visualization",
                                visualization: part.visualization
                                    ? visualizationObjectsItemToInsight(
                                          yamlVisualisationToMetadataObject(
                                              [],
                                              part.visualization as AacVisualisation,
                                          ),
                                      )
                                    : null,
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
                suggestions: convertChatSuggestionItemFromBackend(content.suggestions),
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
                result: tryParseJson(content.result),
            };
        default:
            assertNever(content);
            throw new Error(`Unexpected content: ${JSON.stringify(content)}`);
    }
}

function tryParseJson(jsonString: string): string | object {
    try {
        return JSON.parse(jsonString);
    } catch {
        return jsonString;
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
        filters: cloneWithSanitizedIds(yamlFiltersToDeclarative([], kda.filters as AacFilter[], {}).filters),
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
                    ref: buildObjRef(a.metricId, a.metricType),
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
        certification:
            result.certification === "CERTIFIED"
                ? {
                      status: "CERTIFIED",
                      certificationMessage: result.certificationMessage ?? undefined,
                  }
                : undefined,
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

export function convertChatSuggestionItemFromBackend(
    item: AiSuggestions | null | undefined,
): IChatSuggestions {
    return {
        followUpQuestion: item?.followUpQuestion,
        actions: item?.actions?.map((action) => ({
            label: action.label,
            query: action.query,
        })),
    };
}

function convertAlertProposalFrom(
    alertProposal: AiAlertProposal | null | undefined,
): IAlertProposal | undefined {
    if (!alertProposal) {
        return undefined;
    }

    return {
        title: alertProposal.title,
        description: alertProposal.description ?? "",
        alert: convertAlert(alertProposal.alert),
        schedule: alertProposal.schedule?.cron
            ? {
                  cron: alertProposal.schedule.cron,
                  timezone: alertProposal.schedule.timezone ?? undefined,
              }
            : undefined,
        ...(alertProposal.notificationChannel
            ? {
                  notificationChannel: alertProposal.notificationChannel.id,
                  notificationChannelTitle: alertProposal.notificationChannel.name ?? undefined,
              }
            : {}),
        ...(alertProposal.automationId
            ? {
                  id: alertProposal.automationId,
              }
            : {}),
        ...(alertProposal.dashboard
            ? {
                  dashboard: {
                      id: alertProposal.dashboard.id,
                      title: alertProposal.dashboard.title ?? undefined,
                  },
              }
            : {}),
        recipients: alertProposal.recipients?.map(
            (r) =>
                ({
                    type: "user",
                    id: r.id,
                    name: r.label,
                    email: r.email,
                }) as IAutomationUserRecipient,
        ),
        forLabel: alertProposal.forLabel ?? undefined,
        forMode: alertProposal.forMode ?? undefined,
        cta: alertProposal.cta,
    };
}

function buildObjRef(identifier: string, type: ObjectType | "metric" | string): IdentifierRef {
    return {
        identifier,
        type: (type === "metric" ? "measure" : type) as ObjectType,
    };
}
