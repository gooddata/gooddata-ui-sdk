// (C) 2026 GoodData Corporation

import { defineMessages } from "react-intl";

import type { GenAIInteractionStepCategory, IChatConversationItemDetail } from "@gooddata/sdk-backend-spi";

import type { IChatConversationResponseTrace } from "../../../types.js";

import { excerptForDetail, rowsForDetail } from "./categoryDetailRows.js";
import { mergeDetailRows } from "./mergeDetailRows.js";
import type {
    IInteractionCategory,
    IInteractionCategoryExcerpt,
    IInteractionCategoryExcerptFragment,
    IInteractionIntelligence,
    IInteractionIntelligenceTotals,
    IInteractionStepTile,
} from "./types.js";

/**
 * i18n message id per known category. Typed by {@link GenAIInteractionStepCategory}, so adding a
 * category to the backend's vocabulary fails to compile until its label is authored here.
 */
const CATEGORY_LABEL_MESSAGES = defineMessages({
    applyMemory: { id: "gd.gen-ai.interactionIntelligence.category.applyMemory" },
    catalogSearch: { id: "gd.gen-ai.interactionIntelligence.category.catalogSearch" },
    knowledgeSearch: { id: "gd.gen-ai.interactionIntelligence.category.knowledgeSearch" },
    skillRouting: { id: "gd.gen-ai.interactionIntelligence.category.skillRouting" },
    metricQuery: { id: "gd.gen-ai.interactionIntelligence.category.metricQuery" },
    composeAnswer: { id: "gd.gen-ai.interactionIntelligence.category.composeAnswer" },
}) satisfies Record<GenAIInteractionStepCategory, { id: string }>;

/** One category's accumulated state while walking the turn's steps in order. */
interface ICategoryAccumulator {
    stepIndexes: number[];
    details: IChatConversationItemDetail[];
}

/**
 * Builds the render model for one response: a step carries timing/token spend but no category,
 * the actions within it carry a category but no timing, and the two are joined here.
 *
 * Every action's category is kept, and time stays whole on the step's own tile — nothing is split
 * or summed per category, so two categories highlighting the same tile is not double-counting. A
 * category comes only from `detail.category`; an action without a `detail` yields no category row,
 * though its step keeps its time regardless.
 *
 * A tile's `index` is its array position, not the backend's `stepIndex` — it is the highlight key.
 * A category can also come from a detail that belongs to the response rather than a step, which
 * yields a row with no `stepIndexes` and so nothing to highlight.
 * @internal
 */
export function deriveInteractionIntelligenceFromSteps(
    responseId: string,
    trace: IChatConversationResponseTrace,
): IInteractionIntelligence {
    const sorted = [...trace.steps].sort((a, b) => a.stepIndex - b.stepIndex);
    const byCategory = new Map<GenAIInteractionStepCategory, ICategoryAccumulator>();

    // Seeded first, so a response-scoped category sorts above the steps' own — it happened before
    // them. Its `stepIndexes` stay empty: there is no tile it ran in.
    for (const { detail } of trace.responseDetails ?? []) {
        if (!detail) {
            continue;
        }
        const entry = byCategory.get(detail.category) ?? { stepIndexes: [], details: [] };
        byCategory.set(detail.category, entry);
        entry.details.push(detail);
    }

    const steps: IInteractionStepTile[] = sorted.map((step, index) => {
        const actions = trace.detailsByStepId[step.stepId] ?? [];
        const categoriesInStep: GenAIInteractionStepCategory[] = [];

        for (const { detail } of actions) {
            if (!detail) {
                continue;
            }
            const { category } = detail;
            if (!categoriesInStep.includes(category)) {
                categoriesInStep.push(category);
            }

            const entry = byCategory.get(category) ?? { stepIndexes: [], details: [] };
            byCategory.set(category, entry);
            if (entry.stepIndexes.at(-1) !== index) {
                entry.stepIndexes.push(index);
            }
            entry.details.push(detail);
        }

        return {
            stepId: step.stepId,
            index,
            durationMs: step.durationMs,
            tokens: step.tokens.total,
            categories: categoriesInStep,
        };
    });

    // Map insertion order already reflects each category's earliest step, since steps are
    // walked in order above.
    const categories: IInteractionCategory[] = Array.from(byCategory.entries()).map(([category, entry]) => ({
        category,
        // Absent for a category newer than this client, which `resolveMessage` then renders as
        // the raw category id rather than failing.
        labelId: CATEGORY_LABEL_MESSAGES[category]?.id,
        stepIndexes: entry.stepIndexes,
        excerpt: excerptFor(entry.details),
        detailRows: mergeDetailRows(entry.details.map(rowsForDetail)),
    }));

    return {
        responseId,
        totals: deriveInteractionIntelligenceTotals(trace),
        steps,
        categories,
        traceId: trace.traceId,
    };
}

/**
 * The turn-level totals only, without resolving categories or building any detail rows — cheaper
 * than {@link deriveInteractionIntelligenceFromSteps} for callers (e.g. the inline trigger) that
 * only need the duration/token summary, and the single source of truth both callers share.
 * @internal
 */
export function deriveInteractionIntelligenceTotals(
    trace: IChatConversationResponseTrace,
): IInteractionIntelligenceTotals {
    const reported = trace.steps.filter((step) => step.tokens.total !== undefined);

    return {
        stepsCount: trace.steps.length,
        durationMs: trace.steps.reduce((sum, step) => sum + step.durationMs, 0),
        // Left undefined when no step reported a token total, so "unknown" never renders as "0".
        tokens:
            reported.length === 0
                ? undefined
                : reported.reduce((sum, step) => sum + (step.tokens.total ?? 0), 0),
    };
}

/**
 * Merges a category's per-occurrence excerpt fragments by `id`, summing `count` values — so a
 * category that ran across several steps shows one combined "5 found" rather than
 * "2 found 3 found".
 */
function excerptFor(details: IChatConversationItemDetail[]): IInteractionCategoryExcerpt | undefined {
    const merged = new Map<string, IInteractionCategoryExcerptFragment>();

    for (const fragment of details.flatMap(excerptForDetail)) {
        const previousCount = merged.get(fragment.id)?.values?.["count"];
        const count = fragment.values?.["count"];
        merged.set(
            fragment.id,
            typeof previousCount === "number" && typeof count === "number"
                ? { id: fragment.id, values: { ...fragment.values, count: previousCount + count } }
                : fragment,
        );
    }

    return merged.size === 0 ? undefined : { fragments: Array.from(merged.values()) };
}
