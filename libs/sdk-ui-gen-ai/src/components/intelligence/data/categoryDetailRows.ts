// (C) 2026 GoodData Corporation

import { defineMessages } from "react-intl";

import type {
    GenAIAnswerOutput,
    IChatConversationApplyMemoryDetail,
    IChatConversationCatalogSearchDetail,
    IChatConversationComposeAnswerDetail,
    IChatConversationItemDetail,
    IChatConversationKnowledgeSearchDetail,
    IChatConversationMetricQueryDetail,
    IChatConversationSkillRoutingDetail,
} from "@gooddata/sdk-backend-spi";

import { MAX_DETAIL_LIST_ITEMS } from "./constants.js";
import type {
    IInteractionCategoryExcerptFragment,
    IInteractionStepDetailListItem,
    IInteractionStepDetailRow,
} from "./types.js";

/** i18n message id per {@link GenAIAnswerOutput} value. */
const ANSWER_OUTPUT_LABEL_MESSAGES = defineMessages({
    text: { id: "gd.gen-ai.interactionIntelligence.detail.output.text" },
    visualization: { id: "gd.gen-ai.interactionIntelligence.detail.output.visualization" },
    dashboard: { id: "gd.gen-ai.interactionIntelligence.detail.output.dashboard" },
    keyDriverAnalysis: { id: "gd.gen-ai.interactionIntelligence.detail.output.keyDriverAnalysis" },
    whatIf: { id: "gd.gen-ai.interactionIntelligence.detail.output.whatIf" },
    searchResults: { id: "gd.gen-ai.interactionIntelligence.detail.output.searchResults" },
    alertProposal: { id: "gd.gen-ai.interactionIntelligence.detail.output.alertProposal" },
}) satisfies Record<GenAIAnswerOutput, { id: string }>;

/**
 * Every message this file authors: the detail rows' labels, the count lines above their lists,
 * the match-score suffix, and the excerpt fragments shown on a category's list row.
 */
const MESSAGES = defineMessages({
    query: { id: "gd.gen-ai.interactionIntelligence.detail.query" },
    documents: { id: "gd.gen-ai.interactionIntelligence.detail.documents" },
    bestMatch: { id: "gd.gen-ai.interactionIntelligence.detail.bestMatch" },
    available: { id: "gd.gen-ai.interactionIntelligence.detail.available" },
    activated: { id: "gd.gen-ai.interactionIntelligence.detail.activated" },
    output: { id: "gd.gen-ai.interactionIntelligence.detail.output" },
    model: { id: "gd.gen-ai.interactionIntelligence.detail.model" },
    suggestedActions: { id: "gd.gen-ai.interactionIntelligence.detail.suggestedActions" },
    searched: { id: "gd.gen-ai.interactionIntelligence.detail.searched" },
    found: { id: "gd.gen-ai.interactionIntelligence.detail.found" },
    used: { id: "gd.gen-ai.interactionIntelligence.detail.used" },
    useAlways: { id: "gd.gen-ai.interactionIntelligence.detail.useAlways" },
    useWhenRelevant: { id: "gd.gen-ai.interactionIntelligence.detail.useWhenRelevant" },
    appliedInTotal: { id: "gd.gen-ai.interactionIntelligence.detail.appliedInTotal" },
    memoriesCount: { id: "gd.gen-ai.interactionIntelligence.detail.memoriesCount" },
    skillsCount: { id: "gd.gen-ai.interactionIntelligence.detail.skillsCount" },
    foundGroup: { id: "gd.gen-ai.interactionIntelligence.detail.foundGroup" },
    matchScore: { id: "gd.gen-ai.interactionIntelligence.detail.matchScore" },
    excerptFound: { id: "gd.gen-ai.interactionIntelligence.excerpt.found" },
    excerptUsed: { id: "gd.gen-ai.interactionIntelligence.excerpt.used" },
    excerptDocuments: { id: "gd.gen-ai.interactionIntelligence.excerpt.documents" },
    excerptActivated: { id: "gd.gen-ai.interactionIntelligence.excerpt.activated" },
    excerptMemories: { id: "gd.gen-ai.interactionIntelligence.excerpt.memories" },
    metrics: { id: "gd.gen-ai.interactionIntelligence.detail.metrics" },
    groupedBy: { id: "gd.gen-ai.interactionIntelligence.detail.groupedBy" },
    filteredBy: { id: "gd.gen-ai.interactionIntelligence.detail.filteredBy" },
    visualization: { id: "gd.gen-ai.interactionIntelligence.detail.visualization" },
    result: { id: "gd.gen-ai.interactionIntelligence.detail.result" },
    resultSize: { id: "gd.gen-ai.interactionIntelligence.detail.resultSize" },
});

/**
 * The list row's right-hand excerpt for one occurrence of a category, built from the same
 * `detail` its rows come from. At most two fragments (e.g. "2 found" + "1 used"). Counts are
 * summed across a category's occurrences by the caller — this only reports one occurrence's own.
 * @internal
 */
export function excerptForDetail(detail: IChatConversationItemDetail): IInteractionCategoryExcerptFragment[] {
    switch (detail.category) {
        case "applyMemory":
            return applyMemoryExcerpt(detail);
        case "catalogSearch":
            return catalogSearchExcerpt(detail);
        case "knowledgeSearch":
            return knowledgeSearchExcerpt(detail);
        case "metricQuery":
            return metricQueryExcerpt(detail);
        case "skillRouting":
            return skillRoutingExcerpt(detail);
        case "composeAnswer":
            return composeAnswerExcerpt(detail);
        // A category newer than this client contributes no excerpt rather than breaking the
        // whole render model.
        default:
            return [];
    }
}

function countFragment(id: string, count: number): IInteractionCategoryExcerptFragment[] {
    return count > 0 ? [{ id, values: { count } }] : [];
}

function applyMemoryExcerpt(
    detail: IChatConversationApplyMemoryDetail,
): IInteractionCategoryExcerptFragment[] {
    return countFragment(MESSAGES.excerptMemories.id, detail.items.length);
}

function catalogSearchExcerpt(
    detail: IChatConversationCatalogSearchDetail,
): IInteractionCategoryExcerptFragment[] {
    const foundCount = detail.found.reduce((sum, group) => sum + group.titles.length, 0);
    return [
        ...countFragment(MESSAGES.excerptFound.id, foundCount),
        ...countFragment(MESSAGES.excerptUsed.id, detail.used.length),
    ];
}

function knowledgeSearchExcerpt(
    detail: IChatConversationKnowledgeSearchDetail,
): IInteractionCategoryExcerptFragment[] {
    return countFragment(MESSAGES.excerptDocuments.id, detail.documents.length);
}

/**
 * The size of what a query returned, once both of its halves are known. Not keyed on `count`,
 * which the caller would sum across occurrences — a size must not be summed.
 */
function resultSize(
    detail: IChatConversationMetricQueryDetail,
): { rows: number; columns: number } | undefined {
    const { resultRows, resultColumns } = detail;
    return resultRows === undefined || resultColumns === undefined
        ? undefined
        : { rows: resultRows, columns: resultColumns };
}

function metricQueryExcerpt(
    detail: IChatConversationMetricQueryDetail,
): IInteractionCategoryExcerptFragment[] {
    const size = resultSize(detail);
    return size ? [{ id: MESSAGES.resultSize.id, values: size }] : [];
}

function skillRoutingExcerpt(
    detail: IChatConversationSkillRoutingDetail,
): IInteractionCategoryExcerptFragment[] {
    return countFragment(MESSAGES.excerptActivated.id, detail.activated.length);
}

/**
 * The message id for an output type, or `undefined` for one this client version does not know —
 * a newer backend's value must degrade, not throw partway through building the render model.
 */
function outputLabelId(output: GenAIAnswerOutput | undefined): string | undefined {
    return output ? ANSWER_OUTPUT_LABEL_MESSAGES[output]?.id : undefined;
}

function composeAnswerExcerpt(
    detail: IChatConversationComposeAnswerDetail,
): IInteractionCategoryExcerptFragment[] {
    const id = outputLabelId(detail.output);
    return id ? [{ id }] : [];
}

/** The category's detail rows, built from one action's detail body. */
export function rowsForDetail(detail: IChatConversationItemDetail): IInteractionStepDetailRow[] {
    switch (detail.category) {
        case "applyMemory":
            return applyMemoryRows(detail);
        case "catalogSearch":
            return catalogSearchRows(detail);
        case "knowledgeSearch":
            return knowledgeSearchRows(detail);
        case "metricQuery":
            return metricQueryRows(detail);
        case "skillRouting":
            return skillRoutingRows(detail);
        case "composeAnswer":
            return composeAnswerRows(detail);
        // A category newer than this client shows as a row with no detail content rather than
        // breaking the whole render model.
        default:
            return [];
    }
}

/**
 * A row with a plain text value, or nothing when there is no text to show. `textId` is for a
 * `text` drawn from a known/stable set (e.g. {@link ANSWER_OUTPUT_LABEL_MESSAGES}) — absent
 * otherwise, when the text is never translated.
 */
function textRow(
    labelId: string,
    text: string | number | undefined,
    textId?: string,
    textValues?: Record<string, string | number>,
): IInteractionStepDetailRow[] {
    return text === undefined || text === ""
        ? []
        : [{ labelId, value: { kind: "text", text: String(text), textId, textValues } }];
}

/**
 * The count line above a list. Either a translated message (`id` + its values) or `text` a
 * backend value composes verbatim, never UI copy authored in English here.
 */
type ListHeading = { id: string; values?: Record<string, string | number> } | { text: string };

/**
 * A row listing `items`, truncated past {@link MAX_DETAIL_LIST_ITEMS}, or nothing when the list
 * is empty. Without a `heading` the list renders unbulleted — the "plain stacked list" look used
 * for match lists.
 */
function listRow(
    labelId: string,
    items: IInteractionStepDetailListItem[],
    heading?: ListHeading,
): IInteractionStepDetailRow[] {
    if (items.length === 0) {
        return [];
    }
    return [
        {
            labelId,
            value: {
                kind: "list",
                ...(heading === undefined
                    ? { bulleted: false }
                    : "id" in heading
                      ? { heading: heading.id, headingId: heading.id, headingValues: heading.values }
                      : { heading: heading.text }),
                ...truncate(items),
            },
        },
    ];
}

/** A relevance score as the card shows it, or no suffix when the action did not rank. */
function scoreMeta(score: number | undefined): IInteractionStepDetailListItem["meta"] {
    return score === undefined
        ? undefined
        : { id: MESSAGES.matchScore.id, values: { percent: Math.round(score * 100) } };
}

function knowledgeSearchRows(detail: IChatConversationKnowledgeSearchDetail): IInteractionStepDetailRow[] {
    return [
        ...textRow(MESSAGES.query.id, detail.query),
        ...listRow(
            MESSAGES.documents.id,
            detail.documents.map((document) => ({ label: document.title, meta: scoreMeta(document.score) })),
        ),
        ...textRow(MESSAGES.bestMatch.id, detail.bestMatch),
    ];
}

/** A query's request and execution arrive separately, so each half builds only the rows it covers. */
function metricQueryRows(detail: IChatConversationMetricQueryDetail): IInteractionStepDetailRow[] {
    const size = resultSize(detail);
    return [
        ...listRow(MESSAGES.metrics.id, labels(detail.metrics)),
        ...listRow(MESSAGES.groupedBy.id, labels(detail.groupedBy)),
        ...listRow(MESSAGES.filteredBy.id, labels(detail.filteredBy)),
        ...textRow(MESSAGES.visualization.id, detail.visualization),
        ...(size ? textRow(MESSAGES.result.id, size.rows, MESSAGES.resultSize.id, size) : []),
    ];
}

function skillRoutingRows(detail: IChatConversationSkillRoutingDetail): IInteractionStepDetailRow[] {
    return [
        ...listRow(MESSAGES.available.id, labels(detail.available), {
            id: MESSAGES.skillsCount.id,
            values: { count: detail.available.length },
        }),
        ...listRow(MESSAGES.activated.id, labels(detail.activated)),
    ];
}

function composeAnswerRows(detail: IChatConversationComposeAnswerDetail): IInteractionStepDetailRow[] {
    return [
        ...textRow(
            MESSAGES.output.id,
            // `detail.output` is only shown verbatim if a future output type arrives with no
            // matching message yet — never for an output type we already know.
            detail.output,
            outputLabelId(detail.output),
        ),
        ...textRow(MESSAGES.model.id, detail.modelId),
        ...textRow(MESSAGES.suggestedActions.id, detail.suggestedActions),
    ];
}

/** Counts every item it applied, but lists only the titled ones — an untitled item was still applied. */
function memoryStrategyRow(
    labelId: string,
    items: IChatConversationApplyMemoryDetail["items"],
): IInteractionStepDetailRow[] {
    if (items.length === 0) {
        return [];
    }
    const listed = items.filter((item) => item.title !== "");
    return [
        {
            labelId,
            value: {
                kind: "list",
                heading: MESSAGES.memoriesCount.id,
                headingId: MESSAGES.memoriesCount.id,
                headingValues: { count: items.length },
                ...truncate(listed.map((item) => ({ label: item.title, meta: scoreMeta(item.score) }))),
            },
        },
    ];
}

function applyMemoryRows(detail: IChatConversationApplyMemoryDetail): IInteractionStepDetailRow[] {
    const { items } = detail;
    return [
        ...memoryStrategyRow(
            MESSAGES.useAlways.id,
            items.filter((item) => item.strategy === "always"),
        ),
        ...memoryStrategyRow(
            MESSAGES.useWhenRelevant.id,
            items.filter((item) => item.strategy === "auto"),
        ),
        // A count with no list under it, so a text row rather than a headed empty list.
        ...textRow(MESSAGES.appliedInTotal.id, items.length || undefined, MESSAGES.memoriesCount.id, {
            count: items.length,
        }),
    ];
}

function catalogSearchRows(detail: IChatConversationCatalogSearchDetail): IInteractionStepDetailRow[] {
    const found = detail.found.filter((group) => group.titles.length > 0);
    return [
        ...listRow(
            MESSAGES.query.id,
            detail.query.map((keyword) => ({ label: keyword })),
        ),
        ...listRow(MESSAGES.searched.id, labels(detail.requestedTypes)),
        ...(found.length === 0
            ? []
            : [
                  {
                      labelId: MESSAGES.found.id,
                      value: {
                          kind: "groups" as const,
                          // The count/type composition is translated; `objectType` (e.g. "metric")
                          // is a backend value, interpolated verbatim.
                          groups: found.map((group) => ({
                              heading: MESSAGES.foundGroup.id,
                              headingId: MESSAGES.foundGroup.id,
                              headingValues: {
                                  count: group.titles.length,
                                  objectType: group.objectType,
                              },
                              ...truncate(labels(group.titles)),
                          })),
                      },
                  },
              ]),
        ...listRow(
            MESSAGES.used.id,
            detail.used.map((match) => ({ label: match.title, meta: scoreMeta(match.score) })),
        ),
    ];
}

/** Plain strings as list items. */
function labels(values: string[]): IInteractionStepDetailListItem[] {
    return values.map((label) => ({ label }));
}

/** Caps a list at {@link MAX_DETAIL_LIST_ITEMS}, reporting the remainder as `truncatedCount`. */
function truncate<T>(items: T[]): { items: T[]; truncatedCount?: number } {
    if (items.length <= MAX_DETAIL_LIST_ITEMS) {
        return { items };
    }
    return {
        items: items.slice(0, MAX_DETAIL_LIST_ITEMS),
        truncatedCount: items.length - MAX_DETAIL_LIST_ITEMS,
    };
}
