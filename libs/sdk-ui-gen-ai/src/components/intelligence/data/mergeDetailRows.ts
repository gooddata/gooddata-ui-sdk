// (C) 2026 GoodData Corporation

import { MAX_DETAIL_LIST_ITEMS } from "./constants.js";
import type { IInteractionStepDetailList, IInteractionStepDetailRow } from "./types.js";

/**
 * Merges several occurrences' `detailRows` into one flat set for a category, grouping by
 * `labelId`. A label appearing in only one occurrence keeps that row untouched. A label repeated
 * across occurrences merges by value kind:
 * - `list` rows concatenate `items` (and sum `truncatedCount`), keeping the first occurrence
 *   that authors a `heading`/`bulleted`.
 * - `groups` rows concatenate the `groups` arrays across occurrences, then merge groups that
 *   describe the same thing (same heading key, e.g. Catalogue search's `objectType`) the same way
 *   `list` rows merge — so two steps each finding metrics render one metric group, not two.
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
                groups: mergeGroups(
                    rows.flatMap((row) => (row.value.kind === "groups" ? row.value.groups : [])),
                ),
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
 * Merges already-concatenated groups so that groups describing the same thing become one. Without
 * this, a category running in N steps renders N separate "2 metric" groups instead of one "4
 * metric". Groups with no resolvable key are left alone rather than pooled together, since an
 * unkeyed group carries no evidence it describes the same thing as any other.
 */
function mergeGroups(groups: IInteractionStepDetailList[]): IInteractionStepDetailList[] {
    // One ordered sequence of buckets, so a group renders where it was first seen whether or not
    // it has a key — an unkeyed group is its own bucket and holds its position among the rest.
    const buckets: IInteractionStepDetailList[][] = [];
    const bucketsByKey = new Map<string, IInteractionStepDetailList[]>();

    for (const group of groups) {
        const key = groupKey(group);
        const existing = key === undefined ? undefined : bucketsByKey.get(key);
        if (existing) {
            existing.push(group);
            continue;
        }
        const bucket = [group];
        buckets.push(bucket);
        if (key !== undefined) {
            bucketsByKey.set(key, bucket);
        }
    }

    return buckets.map((bucket) => {
        const [firstGroup] = bucket;
        if (bucket.length === 1) {
            return firstGroup;
        }
        const mergedItems = mergeLists(bucket);
        const totalCount = mergedItems.items.length + (mergedItems.truncatedCount ?? 0);
        return {
            ...firstGroup,
            // Restated from the merged total so the heading describes every occurrence, not the
            // first — matching how the `list` branch restates its own heading count.
            headingValues: firstGroup.headingValues
                ? { ...firstGroup.headingValues, count: totalCount }
                : undefined,
            ...mergedItems,
        };
    });
}

/**
 * Identifies which groups describe the same thing. Keyed on `headingId` together with the
 * heading's interpolated identity (e.g. Catalogue search's `objectType`), so groups from
 * different heading types can never collide — a `headingId` with nothing to interpolate is an
 * identity of its own. Falls back to a verbatim `heading`, and to `undefined` when a group
 * carries no heading at all, which leaves it unmerged.
 */
function groupKey(group: IInteractionStepDetailList): string | undefined {
    const { headingId, headingValues, heading } = group;
    if (headingId === undefined) {
        return heading === undefined ? undefined : `heading:${JSON.stringify(heading)}`;
    }
    // `count` varies per occurrence by definition — it must not take part in the key. The rest
    // is serialized rather than concatenated, so neither a value containing the separator nor a
    // number and its string form can collide.
    const identity = Object.entries(headingValues ?? {})
        .filter(([name]) => name !== "count")
        .sort(([a], [b]) => a.localeCompare(b));

    return `id:${JSON.stringify([headingId, identity])}`;
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
