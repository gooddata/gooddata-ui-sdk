// (C) 2020-2026 GoodData Corporation

import { getAttributesInBuckets } from "../store/buckets/buckets_read_helpers.js";
import { getBucketsState } from "../store/buckets/buckets_selectors.js";
import { type IAppState } from "../store/types.js";

/**
 * Is the insight broken down by anything — i.e. does it have at least one slicing bucket item?
 *
 * The membership rule lives with the buckets domain (`getAttributesInBuckets`, which is
 * `ATTRIBUTE` + `DATE`); the only question left here is the predicate the filter-bar dropdown asks.
 *
 * `count` rather than `.length`: the reader PRESERVES its input's container, so a wrong-kind value
 * would make `undefined > 0` a silent `false` rather than an error.
 */
export function isInsightSliced(state: IAppState): boolean {
    return (getAttributesInBuckets(getBucketsState(state))?.length ?? 0) > 0;
}
