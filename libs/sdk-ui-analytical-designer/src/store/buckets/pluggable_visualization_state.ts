// (C) 2026 GoodData Corporation

import { type IRawBucketItems } from "../../typings/buckets.js";

/**
 * `data.pluggableVisualization` — the queue of derived measures AD wants the pluggable visualization
 * to place on the next extended-reference-point round trip, cleared when it answers.
 *
 * The items are raw bucket items. The subtree's own narrow operations live in
 * `pluggable_visualization_helpers.ts` and its leaf reducer in `pluggable_visualization_leaf.ts`.
 */
export interface IPluggableVisualizationState {
    newDerivedBucketItems: IRawBucketItems;
}

export const pluggableVisualizationInitialState: IPluggableVisualizationState = Object.freeze({
    newDerivedBucketItems: Object.freeze([]) as unknown as IRawBucketItems,
});
