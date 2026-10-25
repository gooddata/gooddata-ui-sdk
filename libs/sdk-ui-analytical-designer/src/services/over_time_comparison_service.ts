// (C) 2007-2026 GoodData Corporation

import { filterCompatibleMeasures } from "../store/buckets/over_time_comparison_helpers.js";
import { type IAppState } from "../store/types.js";
import { type IRawBucketItems } from "../typings/buckets.js";

import { getBuckets, getMasterMeasures } from "./buckets_service.js";

/**
 * Whole-root READERS for over-time comparison. The rules themselves are narrow pure helpers over
 * bucket values (store/buckets/over_time_comparison_helpers.ts); these two are the whole-root entry
 * points the date filter reads through — same implementation, different entry point.
 */

export function getCompatibleMeasures(state: IAppState): IRawBucketItems {
    return filterCompatibleMeasures(getMasterMeasures(state), getBuckets(state));
}

export function areAllCompatibleMeasuresSelected(state: IAppState): boolean {
    return getMasterMeasures(state).length !== getCompatibleMeasures(state).length;
}
