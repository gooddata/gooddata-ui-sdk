// (C) 2026 GoodData Corporation

import { type IBucketsMetaState } from "./buckets_meta_state.js";

/**
 * Narrow pure operations over `data.bucketsMeta`.
 *
 * The subtree is small but it is a real domain: `autoCreated` and `modified` together decide whether a
 * filter the app created on the user's behalf may be removed again on their behalf, which is what the
 * removal chain asks before it takes a filter out (`getUneditedFilters`).
 */

const isAutoCreated = (cacheItemIdentifier: string, bucketsMeta: IBucketsMetaState): boolean =>
    !!(bucketsMeta?.autoCreated?.[cacheItemIdentifier] ?? false);

const isModified = (cacheItemIdentifier: string, bucketsMeta: IBucketsMetaState): boolean =>
    bucketsMeta?.modified?.[cacheItemIdentifier] ?? false;

/**
 * May the app remove this filter on the user's behalf? Only if the app created it on their behalf and
 * they have not touched it since.
 */
export const isUnmodifiedAndAutoCreated = (
    cacheItemIdentifier: string,
    bucketsMeta: IBucketsMetaState,
): boolean =>
    isAutoCreated(cacheItemIdentifier, bucketsMeta) && !isModified(cacheItemIdentifier, bucketsMeta);

/**
 * WHICH per-cache-item marker map a write addresses. The two are written by different domains — the
 * removal chain drops `autoCreated`, the filter-bar edits set `modified` — but the shape is one:
 * `Record<cacheItemIdentifier, boolean>` under a known key of {@link IBucketsMetaState}.
 */
type MarkerMapName = "autoCreated" | "modified";

/**
 * Identity on an unchanged marker is load-bearing in both directions, which is why both writers go
 * through these two: the markers are set on paths that fire per keystroke and dropped for EVERY
 * removed bucket item, so a rebuilt map would dirty `bucketsMeta` on each one.
 */
function setMarker(
    bucketsMeta: IBucketsMetaState,
    mapName: MarkerMapName,
    cacheItemIdentifier: string,
    value: boolean,
): IBucketsMetaState {
    const markers = bucketsMeta?.[mapName];
    // `value` is always a boolean, so an equal reading also proves the key is present.
    if (markers?.[cacheItemIdentifier] === value) {
        return bucketsMeta;
    }
    return { ...bucketsMeta, [mapName]: { ...markers, [cacheItemIdentifier]: value } };
}

function removeMarker(
    bucketsMeta: IBucketsMetaState,
    mapName: MarkerMapName,
    cacheItemIdentifier: string,
): IBucketsMetaState {
    const markers = bucketsMeta?.[mapName];
    if (!markers || !(cacheItemIdentifier in markers)) {
        return bucketsMeta;
    }
    const { [cacheItemIdentifier]: _removed, ...remainingMarkers } = markers;
    return { ...bucketsMeta, [mapName]: remainingMarkers };
}

/**
 * Drops the `autoCreated` marker of one cache item.
 *
 * The absent-identifier guard is what keeps the key a real cache item identifier. A measure bucket
 * item has no `attribute`, and without the guard the key coerces to the string `"undefined"` — which
 * no producer ever writes, so the delete would be a no-op returning the original value. The guard
 * answers that directly. The one input that could tell the two apart is a marker map with a literal
 * `"undefined"` key, which nothing constructs.
 */
export function removeAutoCreatedMarker(
    bucketsMeta: IBucketsMetaState,
    cacheItemIdentifier: string | undefined | null,
): IBucketsMetaState {
    if (cacheItemIdentifier == null) {
        return bucketsMeta;
    }
    return removeMarker(bucketsMeta, "autoCreated", cacheItemIdentifier);
}

/** Drops BOTH markers of one cache item — what a removed filter leaves behind. */
export function removeFilterMarkers(
    bucketsMeta: IBucketsMetaState,
    cacheItemIdentifier: string,
): IBucketsMetaState {
    return removeMarker(
        removeMarker(bucketsMeta, "modified", cacheItemIdentifier),
        "autoCreated",
        cacheItemIdentifier,
    );
}

/** Marks one cache item's filter as touched by the user (or, with `false`, as untouched again). */
export function setModifiedMarker(
    bucketsMeta: IBucketsMetaState,
    cacheItemIdentifier: string,
    value: boolean,
): IBucketsMetaState {
    return setMarker(bucketsMeta, "modified", cacheItemIdentifier, value);
}
