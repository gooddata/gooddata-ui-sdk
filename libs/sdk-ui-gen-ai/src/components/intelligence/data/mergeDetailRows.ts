// (C) 2026 GoodData Corporation

import { MAX_DETAIL_LIST_ITEMS } from "./constants.js";
import type { IInteractionStepDetailList, IInteractionStepDetailRow } from "./types.js";

/**
 * Merges several occurrences' `detailRows` into one flat set for a category, grouping by
 * `labelId`. A label appearing in only one occurrence keeps that row untouched. A label repeated
 * across occurrences merges by value kind:
 * - `list` rows concatenate `items` (and sum `truncatedCount`), keeping the first occurrence
 *   that authors a `heading`/`bulleted`.
 * - `groups` rows concatenate the `groups` arrays across occurrences.
 * - `text` rows become a plain, unheaded `list` of each occurrence's text as one item — the same
 *   "stacked plain list" look already used for single-occurrence match lists like "Used".
 * - Mismatched kinds across occurrences fall back to the first occurrence's row.
 * @internal
 */
export function mergeDetailRows(rowGroups: IInteractionStepDetailRow[][]): IInteractionStepDetailRow[] {
    // Map keeps first-seen label order, which is the order the rows render in.
    const rowsByLabel = new Map<string, IInteractionStepDetailRow[]>();

    for (const row of rowGroups.flat()) {
        const existing = rowsByLabel.get(row.labelId);
        if (existing) {
            existing.push(row);
        } else {
            rowsByLabel.set(row.labelId, [row]);
        }
    }

    return Array.from(rowsByLabel.values(), mergeRowGroup);
}

function mergeRowGroup(rows: IInteractionStepDetailRow[]): IInteractionStepDetailRow {
    const [first] = rows;
    if (rows.length === 1) {
        return first;
    }

    const kinds = new Set(rows.map((row) => row.value.kind));

    if (kinds.size === 1 && kinds.has("list")) {
        const lists = rows.flatMap((row) => (row.value.kind === "list" ? [row.value] : []));
        const headingSource = lists.find((list) => list.heading) ?? lists[0];
        const merged = mergeLists(lists);
        const totalCount = merged.items.length + (merged.truncatedCount ?? 0);
        return {
            labelId: first.labelId,
            value: {
                kind: "list",
                heading: headingSource.heading,
                // Carried over, or the heading renders as its raw message id. Its `count` is
                // restated from the merged total so it describes every occurrence, not the first.
                headingId: headingSource.headingId,
                headingValues: headingSource.headingValues
                    ? { ...headingSource.headingValues, count: totalCount }
                    : undefined,
                bulleted: headingSource.bulleted,
                ...merged,
            },
        };
    }

    if (kinds.size === 1 && kinds.has("groups")) {
        return {
            labelId: first.labelId,
            value: {
                kind: "groups",
                groups: rows.flatMap((row) => (row.value.kind === "groups" ? row.value.groups : [])),
            },
        };
    }

    if (kinds.size === 1 && kinds.has("text")) {
        return {
            labelId: first.labelId,
            value: {
                kind: "list",
                bulleted: false,
                items: rows.map((row) => ({ label: row.value.kind === "text" ? row.value.text : "" })),
            },
        };
    }

    // Mismatched value kinds across occurrences: fall back to the first occurrence's row.
    return first;
}

/**
 * Concatenates several lists' `items` and sums their `truncatedCount`s, re-applying the per-list
 * cap to the result — each occurrence was capped on its own, so concatenating N of them would
 * otherwise render N times the intended number of items.
 */
function mergeLists(
    lists: IInteractionStepDetailList[],
): Pick<IInteractionStepDetailList, "items" | "truncatedCount"> {
    const items = lists.flatMap((list) => list.items);
    const alreadyTruncated = lists.reduce((sum, list) => sum + (list.truncatedCount ?? 0), 0);
    const overflow = Math.max(items.length - MAX_DETAIL_LIST_ITEMS, 0);

    return {
        items: overflow === 0 ? items : items.slice(0, MAX_DETAIL_LIST_ITEMS),
        truncatedCount: alreadyTruncated + overflow || undefined,
    };
}
