// (C) 2026 GoodData Corporation

import { isEqual, mergeWith } from "lodash-es";

import { type IDateDatasetsMeta } from "../../models/date_datasets_meta.js";
import { type ICacheItem, type ICatalogEntry } from "../../typings/state_objects.js";

import { type IItemCacheState } from "./item_cache_state.js";

/**
 * A re-sent entry's array-valued fields REPLACE the cached ones.
 *
 * Concatenating them instead is a live bug, because every producer re-sends WHOLE entries — the
 * catalog saga sends the full catalog on each load,
 * `open_report_sagas` sends the opened insight's items, the postMessage filtering saga sends
 * deserialized attributes, and the metric-filter ADD operation re-sends the attribute it just
 * filtered on (a `measureFilterAdded` slice case).
 * With concatenation, a second load of the same attribute grows `displayForms` BY ITS OWN LENGTH
 * (4 → 8 → 12) and the bucket item's "Display as" dropdown lists every display form once per load.
 * Nothing in the domain accumulates across payloads deliberately.
 *
 * lodash's own array handling is not the alternative: plain `merge` overlays BY INDEX, so a shorter
 * new array leaves a stale tail behind. Only a whole-array replace is correct.
 *
 * Returning `undefined` for every non-array value falls through to lodash, which is what preserves
 * the field-by-field entry merge (an entry re-sent with a subset of fields keeps the rest).
 */
function replaceArrayFields(_cached: unknown, incoming: unknown): unknown[] | undefined {
    return Array.isArray(incoming) ? [...incoming] : undefined;
}

/**
 * Deep-merges catalog items into the cache. The semantics, all pinned by the suite: entries merge
 * FIELD BY FIELD (an entry re-sent with a subset of fields keeps the rest), nested objects merge
 * recursively, and array-valued fields are REPLACED by the incoming ones (see
 * {@link replaceArrayFields} — concatenating them loses display forms).
 *
 * lodash carries the recursion, but a bare `merge({}, cache, items)` would be wrong twice:
 *
 * - it merges arrays BY INDEX, which leaves a stale tail when the incoming array is shorter;
 * - it ALWAYS allocates, so a no-op merge would hand the store a fresh object on every dispatch,
 *   dirty the subtree and invalidate every memoized selector hanging off it. Identity has to be
 *   re-established EXPLICITLY, which is what the per-entry `isEqual` guard and the `changed` flag
 *   do.
 */
export function mergeItemsIntoCache(
    cache: IItemCacheState,
    items: Record<string, ICacheItem> | Record<string, unknown>,
): IItemCacheState {
    const merged = { ...cache };
    let changed = false;

    Object.entries(items ?? {}).forEach(([key, item]) => {
        const nextEntry = mergeWith({}, cache[key], item, replaceArrayFields) as ICatalogEntry;
        if (!isEqual(cache[key], nextEntry)) {
            merged[key] = nextEntry;
            changed = true;
        }
    });

    return changed ? merged : cache;
}

/**
 * The granularity attributes of every date dataset in the meta payload, shaped as cache entries
 * keyed by granularity. A meta item without attributes is skipped.
 *
 * `displayForms` is written ONLY when the payload carries it, and that is load-bearing: incoming
 * arrays REPLACE (see {@link replaceArrayFields}), so defaulting to `[]` would WIPE the cached
 * display forms of a granularity a previous payload populated. Omitting the key makes it a no-op —
 * lodash skips absent keys, and every reader defaults a missing value to `[]`.
 */
export function granularityCacheItems(dateDatasetsMeta: IDateDatasetsMeta): Record<string, unknown> {
    const cacheItems: Record<string, unknown> = {};

    (dateDatasetsMeta?.items ?? []).forEach((dateDatasetMetaItem) => {
        (dateDatasetMetaItem.attributes ?? []).forEach((item) => {
            const identifier = item.granularity;
            cacheItems[identifier] = { identifier, ...item };
        });
    });

    return cacheItems;
}
