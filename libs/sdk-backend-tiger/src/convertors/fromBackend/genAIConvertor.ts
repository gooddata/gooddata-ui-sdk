// (C) 2024-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import {
    type AiAlertProposal,
    type AiContent,
    type AiConversationItemResponse,
    type AiConversationItemResponseDetail,
    type AiConversationResponse,
    type AiConversationResponseList,
    type AiConversationTurnResponse,
    type AiInteractionStepResponse,
    type AiKeyDriverAnalysis,
    type AiSearchObject,
    type AiSearchRelationship,
    type AiSuggestions,
    type AiWhatIfScenario,
    type DeclarativeAnalyticalDashboard,
    type DeclarativeFilterContext,
    type JsonApiAnalyticalDashboardOutAttributes,
    type JsonApiAnalyticalDashboardOutDocument,
    type JsonApiFilterContextInAttributes,
    type JsonApiFilterContextOutDocument,
} from "@gooddata/api-client-tiger";
import {
    type IAlertProposal,
    type IChatConversation,
    type IChatConversationContent,
    type IChatConversationError,
    type IChatConversationFeedback,
    type IChatConversationInteractionStep,
    type IChatConversationItem,
    type IChatConversationItemDetail,
    type IChatConversationMultipartPart,
    type IChatKdaDefinition,
    type IChatSuggestions,
    type IChatWhatIfDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    type AacDashboard,
    type AacFilter,
    type AacVisualisation,
    yamlDashboardToDeclarative,
    yamlFiltersToDeclarative,
    yamlVisualisationToMetadataObject,
} from "@gooddata/sdk-code-convertors";
import {
    type GenAIObjectType,
    type IAutomationUserRecipient,
    type IDashboard,
    type IFilterContext,
    type IFilterContextDefinition,
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
    type ITempFilterContext,
    type IdentifierRef,
    type ObjectType,
    assertNever,
} from "@gooddata/sdk-model";

import { getFormatByGranularity } from "../../utils/dateUtils.js";

import { convertMeasure } from "./afm/MeasureConverter.js";
import {
    convertDashboard,
    convertFilterContextFromBackend,
} from "./analyticalDashboards/AnalyticalDashboardConverter.js";
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
): IChatConversationItem | undefined {
    const content = convertChatConversationContentFromBackend(item.content, dateNormalizer, locale, timezone);
    if (!content) {
        return undefined;
    }

    const response = responses?.find((r) => r.responseId === item.responseId);

    return {
        type: "item",
        id: item.itemId,
        role: item.role,
        responseId: item.responseId ?? "",
        replyTo: item.replyTo ?? undefined,
        createdAt: new Date(item.createdAt).getTime(),
        feedback: convertChatConversationFeedbackFromBackend(response),
        content,
        stepId: item.stepId ?? undefined,
        detail: convertChatConversationItemDetailFromBackend(item.detail),
        agentId: item.newAgentId ?? undefined,
        oldAgentId: item.oldAgentId ?? undefined,
        reasoningEffort: item.reasoningEffort ?? undefined,
    };
}

export function convertChatConversationItemsFromBackend(
    items: AiConversationItemResponse[],
    responses: AiConversationResponseList["responses"] | undefined,
    dateNormalizer: DateNormalizer,
    locale?: FormattingLocale,
    timezone?: string,
): IChatConversationItem[] {
    return items
        .map((item) =>
            convertChatConversationItemFromBackend(item, responses, dateNormalizer, locale, timezone),
        )
        .filter((item): item is IChatConversationItem => item !== undefined);
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
): IChatConversationContent | undefined {
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
                // Unknown parts are dropped rather than failing the whole item, so the rest
                // of the message (known parts) keeps rendering normally.
                parts: content.parts
                    .map((part): IChatConversationMultipartPart | undefined => {
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
                            case "dashboard": {
                                const data = part.dashboard
                                    ? yamlDashboardToDeclarative([], part.dashboard as AacDashboard)
                                    : null;

                                const filters = data?.filterContext
                                    ? convertFilterContextFromBackend(
                                          buildFilterContextWrapper(data.filterContext),
                                      )
                                    : undefined;

                                const insights =
                                    part.references?.visualizations.map((vis) => {
                                        return visualizationObjectsItemToInsight(
                                            yamlVisualisationToMetadataObject([], vis as AacVisualisation),
                                        );
                                    }) ?? null;

                                const dashboard = data
                                    ? convertDashboard(
                                          buildDashboardWrapper(
                                              data.dashboard,
                                              data.tabFilterContexts,
                                              part.saved_dashboard_id,
                                          ),
                                          filters,
                                      )
                                    : null;

                                const saved = !!part.saved_dashboard_id;

                                return {
                                    type: "dashboard",
                                    saved,
                                    insights,
                                    dashboard: convertToTemporaryFilterContexts(dashboard),
                                };
                            }
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
                                // Unknown part type (e.g. sent by a newer backend): log and drop
                                // it, do not fail the whole item.
                                assertNever(part);
                                return undefined;
                        }
                    })
                    .filter((part): part is IChatConversationMultipartPart => part !== undefined),
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
            // Unknown content type (e.g. sent by a newer backend): log and drop the item,
            // do not fail the whole conversation stream.
            assertNever(content);
            return undefined;
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

/**
 * Converts the `interaction_step` SSE payload to its domain shape. `type` is stamped here — the
 * payload has no discriminator of its own, the SSE event name carries that.
 */
export function convertChatConversationInteractionStepFromBackend(
    step: AiInteractionStepResponse,
    traceId?: string,
): IChatConversationInteractionStep {
    return {
        type: "interaction_step",
        stepId: step.stepId,
        conversationId: step.conversationId,
        responseId: step.responseId,
        stepIndex: step.stepIndex,
        durationMs: step.durationMs,
        tokens: {
            input: step.tokens.input ?? undefined,
            output: step.tokens.output ?? undefined,
            total: step.tokens.total ?? undefined,
        },
        createdAt: new Date(step.createdAt).getTime(),
        traceId,
    };
}

/**
 * Converts one conversation item's `detail` — what that action did. Returns `undefined` for a
 * category this client version does not know, so a newer backend's body degrades to "no card
 * content" rather than failing the whole item.
 */
export function convertChatConversationItemDetailFromBackend(
    detail: AiConversationItemResponseDetail | null | undefined,
): IChatConversationItemDetail | undefined {
    switch (detail?.category) {
        case "applyMemory":
            return {
                category: "applyMemory",
                items: (detail.items ?? []).map((item) => ({
                    title: item.title,
                    // The backend spells the strategy in upper case; the domain shape keeps the
                    // lower-case form the rest of the SDK uses for enum-like values.
                    strategy: item.strategy === "ALWAYS" ? "always" : "auto",
                    score: item.score ?? undefined,
                })),
            };
        case "catalogSearch":
            return {
                category: "catalogSearch",
                query: detail.query ?? [],
                requestedTypes: detail.requestedTypes ?? [],
                found: (detail.found ?? []).map((group) => ({
                    objectType: group.objectType,
                    titles: group.titles ?? [],
                })),
                used: detail.used ?? [],
            };
        case "composeAnswer":
            return {
                category: "composeAnswer",
                modelId: detail.modelId ?? undefined,
                suggestedActions: detail.suggestedActions ?? undefined,
                output: detail.output ?? undefined,
            };
        case "knowledgeSearch":
            return {
                category: "knowledgeSearch",
                query: detail.query ?? undefined,
                documents: (detail.documents ?? []).map((document) => ({
                    title: document.title,
                    score: document.score ?? undefined,
                })),
                bestMatch: detail.bestMatch ?? undefined,
            };
        case "metricQuery":
            return {
                category: "metricQuery",
                ref: detail.ref ?? undefined,
                metrics: detail.metrics ?? [],
                groupedBy: detail.groupedBy ?? [],
                filteredBy: detail.filteredBy ?? [],
                visualization: detail.visualization ?? undefined,
                resultRows: detail.resultRows ?? undefined,
                resultColumns: detail.resultColumns ?? undefined,
            };
        case "skillRouting":
            return {
                category: "skillRouting",
                available: detail.available ?? [],
                activated: detail.activated ?? [],
            };
        default:
            // A category this client version does not know yet degrades to "no card content"
            // rather than failing the whole item.
            return undefined;
    }
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

function buildFilterContextWrapper(filterContext: DeclarativeFilterContext): JsonApiFilterContextOutDocument {
    return {
        data: {
            id: filterContext.id,
            type: "filterContext",
            attributes: filterContext as JsonApiFilterContextInAttributes,
        },
        links: {
            self: "",
        },
    };
}

function buildDashboardWrapper(
    dashboard: DeclarativeAnalyticalDashboard,
    tabFilterContexts: DeclarativeFilterContext[] = [],
    savedDashboardId?: string | null,
): JsonApiAnalyticalDashboardOutDocument {
    return {
        data: {
            id: savedDashboardId ?? dashboard.id,
            type: "analyticalDashboard",
            attributes: dashboard as JsonApiAnalyticalDashboardOutAttributes,
        },
        included: tabFilterContexts?.map((fc) => ({
            type: "filterContext",
            attributes: fc as JsonApiFilterContextInAttributes,
            id: fc.id,
            links: {
                self: "",
            },
        })),
        links: {
            self: "",
        },
    };
}

function convertToTemporaryFilterContexts(dashboard: IDashboard | null): IDashboard | null {
    if (!dashboard) {
        return null;
    }

    return {
        ...dashboard,
        ...asNonPersistedFilterContext(dashboard),
        ...(dashboard.tabs
            ? {
                  tabs: dashboard.tabs.map((tab) => ({
                      ...tab,
                      ...asNonPersistedFilterContext(tab),
                  })),
              }
            : {}),
    } as IDashboard;
}

function asNonPersistedFilterContext<T>(
    fc: T & { filterContext?: IFilterContext | ITempFilterContext | IFilterContextDefinition },
): {
    filterContext?: IFilterContextDefinition;
} {
    if (!fc.filterContext) {
        return {};
    }

    return {
        filterContext: {
            title: "",
            description: "",
            ...fc.filterContext,
            ref: undefined,
            identifier: undefined,
            uri: undefined,
        },
    };
}
