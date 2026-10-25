// (C) 2026 GoodData Corporation

import { isEqual } from "lodash-es";

import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import { type IRawBuckets } from "../../typings/buckets.js";
import { areBucketTotalsIdentical, setBucketTotals } from "../buckets/buckets_totals_helpers.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";
import {
    type IRefPointFiltersBucket,
    type IReferencePointState,
} from "../reference_point/reference_point_state.js";
import { syncReferencePoint } from "../reference_point/reference_point_sync.js";

import { type IPropertiesState } from "./properties_state.js";

/**
 * THE PROPERTIES-CHANGE OPERATION — `STORE_VIS_PROPERTIES_CHANGED`, the one genuine cascade of the
 * properties family.
 *
 * One pluggable-visualization properties push decides FOUR domains: the stored properties (minus the
 * `totals`/`bucketType` riders that belong to the buckets), the extended reference point's mirror of
 * them, the bucket totals the riders carry, and — only when the totals actually land — the re-synced
 * reference point and the md-object flag. The trigger writes nothing; this calculation names all of
 * it in ONE event.
 *
 * TWO CONTROL-FLOW FACTS ARE LOAD-BEARING:
 *
 * 1. **the totals guard decides the sync.** An absent or deep-equal totals payload must NOT re-sync
 *    the reference point or clear the md flag; a totals payload addressing a bucket that does not
 *    exist MUST. Both change no buckets, so identity of the buckets cannot tell them apart — hence
 *    `areBucketTotalsIdentical` as a predicate, and hence the conditional flag in the result;
 * 2. **the sync reads the sort items THIS push stored.** A saga `select` would read the PRE-trigger
 *    state, so the sync takes the sort items from the properties value this operation just computed,
 *    never from a boundary read.
 */

export interface IVisualizationPropertiesChangeInput {
    buckets: IRawBuckets;
    visualizationProperties: IPropertiesState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

/** The trigger's own payload — the merge already happened in `sagas/properties_sagas.ts`. */
export interface IVisualizationPropertiesChangeParams {
    newCurrentProperties: IVisualizationProperties | undefined;
    newMergedProperties: IVisualizationProperties | undefined;
}

export interface IVisualizationPropertiesChangeDeps {
    /** as a VALUE — this operation rewrites neither the filter bar nor the buckets meta */
    refPointFilters: IRefPointFiltersBucket;
}

export interface IVisualizationPropertiesChangeResult {
    visualizationProperties: IPropertiesState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    buckets: IRawBuckets;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

const withoutBucketRiders = (
    properties: IVisualizationProperties | undefined,
): IVisualizationProperties | undefined => {
    if (!properties) {
        return properties;
    }
    const { totals: _totals, bucketType: _bucketType, ...rest } = properties;
    return rest;
};

export function applyVisualizationProperties(
    input: IVisualizationPropertiesChangeInput,
    { newCurrentProperties, newMergedProperties }: IVisualizationPropertiesChangeParams,
    deps: IVisualizationPropertiesChangeDeps,
): IVisualizationPropertiesChangeResult {
    const newMergedPropertiesWithoutTotals = withoutBucketRiders(newMergedProperties);
    const newCurrentPropertiesWithoutTotals = withoutBucketRiders(newCurrentProperties);

    // an absent merge keeps the stored value, a deep-equal one keeps the REFERENCE (the slice's
    // explicit `isEqual` guard — identity is explicit, never inherited)
    const visualizationProperties =
        !newMergedPropertiesWithoutTotals ||
        isEqual(input.visualizationProperties, newMergedPropertiesWithoutTotals)
            ? input.visualizationProperties
            : newMergedPropertiesWithoutTotals;

    // AN EXISTENCE CHECK — "has a pluggable visualization reported an extended reference point
    // back". Do NOT replace it with `!isEmpty(...)`: `isEmpty({})` is TRUE and would silently stop
    // the write for an ERP that exists but carries nothing (pinned by
    // reducers/test/properties_characterization.test.ts).
    const extendedReferencePoint =
        newMergedPropertiesWithoutTotals &&
        input.extendedReferencePoint != null &&
        input.extendedReferencePoint.properties !== newCurrentPropertiesWithoutTotals
            ? { ...input.extendedReferencePoint, properties: newCurrentPropertiesWithoutTotals }
            : input.extendedReferencePoint;

    // the riders' half — fact 1 of the module note
    const totals = newMergedProperties?.["totals"];
    const bucketType: string = newMergedProperties?.["bucketType"];

    if (!totals || areBucketTotalsIdentical(input.buckets, totals, bucketType)) {
        return {
            visualizationProperties,
            extendedReferencePoint,
            buckets: input.buckets,
            referencePoint: input.referencePoint,
            isVisualizationMdObjectValid: input.isVisualizationMdObjectValid,
        };
    }

    const buckets = setBucketTotals(input.buckets, totals, bucketType);

    return {
        visualizationProperties,
        extendedReferencePoint,
        buckets,
        // fact 2: the sort items come from the properties value computed above
        referencePoint: syncReferencePoint(
            input.referencePoint,
            buckets,
            deps.refPointFilters,
            visualizationProperties?.sortItems,
        ),
        isVisualizationMdObjectValid: false,
    };
}
