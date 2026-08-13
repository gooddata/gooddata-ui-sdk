// (C) 2026 GoodData Corporation

import type { GenAIInteractionStepCategory } from "@gooddata/sdk-backend-spi";

/**
 * One item within a {@link IInteractionStepDetailList}. `meta` is a translated suffix shown
 * dimmed after the item (e.g. a match percentage).
 * @internal
 */
export interface IInteractionStepDetailListItem {
    label: string;
    meta?: { id: string; values?: Record<string, string | number> };
}

/**
 * A count + list of items, optionally truncated, with `truncatedCount` covering the rest (e.g.
 * "100 memories" showing 3 items plus "...and 97 more"). `heading` is the count line (e.g. "3
 * files", "4 skills"); omit it to render the list with no count line above it (e.g. a plain
 * stacked "Used" list).
 * @internal
 */
export interface IInteractionStepDetailList {
    /**
     * i18n message id for `heading`, when it is one of a known/stable set (interpolated with
     * `headingValues`). Falls back to rendering `heading` verbatim when absent.
     */
    headingId?: string;
    /** Values to interpolate into `headingId`'s message, e.g. `{ count: 4 }`. */
    headingValues?: Record<string, string | number>;
    heading?: string;
    items: IInteractionStepDetailListItem[];
    /** Number of further items not included in `items`, when the list was truncated. */
    truncatedCount?: number;
    /** Renders without bullet markers — used for "Used" style single-column match lists. */
    bulleted?: boolean;
}

/**
 * One key/value row shown in a category's detail view. The value is one of: plain text, a
 * single count+list, or several independent count+lists stacked under one label (e.g. Catalogue
 * search's "Query" row: a metrics list and a date-dimensions list together).
 * @internal
 */
export interface IInteractionStepDetailRow {
    /** i18n message id for the row's label — every row label is authored, so always resolvable. */
    labelId: string;
    value: IInteractionStepDetailRowValue;
}

/**
 * @internal
 */
export type IInteractionStepDetailRowValue =
    | {
          kind: "text";
          /**
           * i18n message id for `text`, when it is one of a known/stable set. Falls back to
           * rendering `text` verbatim when absent.
           */
          textId?: string;
          text: string;
      }
    | ({ kind: "list" } & IInteractionStepDetailList)
    | { kind: "groups"; groups: IInteractionStepDetailList[] };

/**
 * One fragment of a category row's right-hand excerpt (e.g. "2 found", "1 used"). `id` is
 * always authored, so an excerpt is always fully translatable.
 * @internal
 */
export interface IInteractionCategoryExcerptFragment {
    id: string;
    values?: Record<string, string | number>;
}

/**
 * The short right-hand summary shown on a category's list row, e.g. "110 memories", or the two
 * fragments "2 found" + "1 used" for Catalogue search. Absent renders no excerpt.
 * @internal
 */
export interface IInteractionCategoryExcerpt {
    fragments: IInteractionCategoryExcerptFragment[];
}

/**
 * One interaction step: the only carrier of time and token spend, and one tile of the shared
 * timeline. `categories` lists the categories that ran within it, in first-seen order — empty
 * when none of its actions carried a recognized category, in which case the tile still keeps
 * its own time on the timeline but produces no category row.
 * @internal
 */
export interface IInteractionStepTile {
    stepId: string;
    /** This tile's position in {@link IInteractionIntelligence.steps} — the highlight key. */
    index: number;
    durationMs: number;
    tokens?: number;
    categories: GenAIInteractionStepCategory[];
}

/**
 * One category: a list row and a detail page. Never carries a duration or token count — time and
 * tokens live only on {@link IInteractionStepTile}, which this only references by index.
 * @internal
 */
export interface IInteractionCategory {
    /**
     * The category as the backend sends it. Maps to an icon with a safe default, and is the
     * display fallback when `labelId` is absent.
     */
    category: GenAIInteractionStepCategory;
    /** i18n message id for the category's display label, when it is one of a known/stable set. */
    labelId?: string;
    /** Indexes into {@link IInteractionIntelligence.steps} where this category occurred. */
    stepIndexes: number[];
    /** The list row's right-hand summary. Absent renders no excerpt. */
    excerpt?: IInteractionCategoryExcerpt;
    /**
     * Detail rows merged across every occurrence of this category, by grouping on row label: a
     * label appearing in more than one occurrence gets one row whose list items/groups are
     * concatenated in occurrence order (a repeated text value becomes a plain stacked list).
     */
    detailRows: IInteractionStepDetailRow[];
}

/**
 * Turn-level totals, computed straight from the steps — independent of category resolution.
 * @internal
 */
export interface IInteractionIntelligenceTotals {
    stepsCount: number;
    durationMs: number;
    tokens?: number;
}

/**
 * The full render model for one assistant response's Interaction Intelligence data.
 * @internal
 */
export interface IInteractionIntelligence {
    responseId: string;
    totals: IInteractionIntelligenceTotals;
    /** The timeline, in step order. */
    steps: IInteractionStepTile[];
    /** The list rows, ordered by each category's earliest step. */
    categories: IInteractionCategory[];
    /** Backend trace id of this response, for support/debugging. Absent when never received. */
    traceId?: string;
}

/**
 * One tile of the shared timeline track: a single step's slot in the turn, sized proportionally
 * to its duration.
 * @internal
 */
export interface ITimelineSegment {
    stepId: string;
    /** Index into {@link IInteractionIntelligence.steps} — the highlight key. */
    stepIndex: number;
    widthPct: number;
}

/**
 * The modes the panel can render: the full list/timeline view or a single category's detail view.
 * @public
 */
export type InteractionIntelligenceMode = "list" | "detail";
