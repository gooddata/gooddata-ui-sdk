// (C) 2026 GoodData Corporation

import { type IRawBucketItem, type IRawBucketItems } from "../../typings/buckets.js";

import { type IPluggableVisualizationState } from "./pluggable_visualization_state.js";

/**
 * Narrow pure operations over `data.pluggableVisualization`.
 *
 * The subtree is ONE queue: the derived measures AD wants the pluggable visualization to place,
 * handed over on the next extended-reference-point round trip and cleared when it answers
 * (`NEW_DERIVED_BUCKET_ITEMS_PLACED`). The items are raw bucket items, built by
 * `createDerivedMeasure` on both producer paths.
 *
 * The queue's whole-root entry points live in services/pluggable_visualization_service.ts.
 */

/** `[]` BY REFERENCE for the absent-queue case: a fresh array per read would defeat memoization. */
const NO_DERIVED_BUCKET_ITEMS: IRawBucketItems = Object.freeze([]) as unknown as IRawBucketItems;

export function getNewDerivedBucketItems(
    pluggableVisualization: IPluggableVisualizationState | undefined,
): IRawBucketItems {
    return pluggableVisualization?.newDerivedBucketItems ?? NO_DERIVED_BUCKET_ITEMS;
}

export function setNewDerivedBucketItems(
    pluggableVisualization: IPluggableVisualizationState | undefined,
    newDerivedBucketItems: IRawBucketItems,
): IPluggableVisualizationState {
    return { ...pluggableVisualization, newDerivedBucketItems };
}

export function appendNewDerivedBucketItem(
    pluggableVisualization: IPluggableVisualizationState | undefined,
    derivedBucketItem: IRawBucketItem,
): IPluggableVisualizationState {
    return setNewDerivedBucketItems(pluggableVisualization, [
        ...getNewDerivedBucketItems(pluggableVisualization),
        derivedBucketItem,
    ]);
}

/**
 * Empties the queue. GUARDED: an already-empty queue answers the SAME value, so the
 * `NEW_DERIVED_BUCKET_ITEMS_PLACED` clear stops producing a fresh array — and therefore a fresh
 * root — on every plug-viz answer that placed nothing. Asserted by the helper suite.
 */
export function clearNewDerivedBucketItems(
    pluggableVisualization: IPluggableVisualizationState | undefined,
): IPluggableVisualizationState {
    if (pluggableVisualization !== undefined && pluggableVisualization.newDerivedBucketItems?.length === 0) {
        return pluggableVisualization;
    }
    return setNewDerivedBucketItems(pluggableVisualization, NO_DERIVED_BUCKET_ITEMS);
}
