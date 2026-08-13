// (C) 2026 GoodData Corporation

import type { GenAIInteractionStepCategory } from "@gooddata/sdk-backend-spi";
import type { IconType } from "@gooddata/sdk-ui-kit";

/**
 * Default icon shown for a category with no explicit mapping in {@link CATEGORY_ICONS}.
 * @internal
 */
export const DEFAULT_STEP_ICON: IconType = "questionMark";

/**
 * Longest list rendered in a detail row before the rest collapse into a "…and N more". Applied
 * both when a row is built and again after merging a category's occurrences.
 * @internal
 */
export const MAX_DETAIL_LIST_ITEMS = 5;

/**
 * Category -> icon mapping. Typed by {@link GenAIInteractionStepCategory}, so adding a category to
 * the backend's vocabulary fails to compile until its icon is chosen here. A category still
 * missing at runtime (an older client meeting a newer backend) falls back to
 * {@link DEFAULT_STEP_ICON}.
 * @internal
 */
export const CATEGORY_ICONS: Record<GenAIInteractionStepCategory, IconType> = {
    applyMemory: "brain",
    skillRouting: "genai2",
    knowledgeSearch: "search",
    catalogSearch: "search",
    metricQuery: "metric",
    composeAnswer: "speechBubble",
};
