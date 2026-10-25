// (C) 2007-2026 GoodData Corporation

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import {
    findDerivedMeasure,
    getLocalIdentifier,
    getOperandLocalIdentifiers,
    isArithmeticMeasure,
    isDerived,
    isDerivedFrom,
    isValidArithmeticMeasure,
} from "../../models/bucket_item.js";
import { type IRawBucketItem, type IRawBucketItems, type IRawBuckets } from "../../typings/buckets.js";
import { type IBucketNotificationsState } from "../bucket_notifications/bucket_notifications_types.js";
import { replaceRankingFilterMeasure } from "../filter_bar/filter_bar_helpers.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import { validateVisualizationProperties } from "../reference_point/extended_reference_point_helpers.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncDeps,
    syncReferencePointForBuckets,
} from "../reference_point/reference_point_sync.js";

import {
    getBucketIndexInBuckets,
    getBucketItemIndexInBuckets,
    insertBucketItem,
    updateBucketItemsAt,
} from "./bucket_item_address.js";
import { type IBucketsMetaState } from "./buckets_meta_state.js";
import { getDerivedBucketItemsInBuckets, getMeasuresInBuckets } from "./buckets_read_helpers.js";
import { type IRemoveBucketItemsDeps, removeBucketItemsWithDependencies } from "./buckets_removal_helpers.js";
import { replaceDerivedTotalItems, sanitizeTotals } from "./buckets_totals_helpers.js";
import { findDerivedBucketItemsInBuckets } from "./buckets_write_helpers.js";
import { createDerivedMeasure, transformDerivedMeasure } from "./derived_measure_helpers.js";
import { isDateItem } from "./helpers/bucket_item_predicates.js";
import { findReplacedBucketItemInsertionIndex } from "./helpers/bucket_layout.js";
import { appendNewDerivedBucketItem } from "./pluggable_visualization_helpers.js";
import { type IPluggableVisualizationState } from "./pluggable_visualization_state.js";

/**
 * Over-time comparison as narrow pure helpers over bucket VALUES.
 *
 * "Compatible" means: a master measure AD can attach a derived (previous period / same period last
 * year) measure to — one without its own date filter, and, if it is an arithmetic measure, a valid
 * one whose operands are not themselves derived. The whole-root readers in
 * services/over_time_comparison_service.ts delegate here; the writer answers the derived-measure
 * QUEUE value rather than a root state.
 *
 * {@link setBucketItemOverTimeComparison} at the bottom is the wide cross-domain calculation. Its
 * `createDerivedMeasure` comes from `derived_measure_helpers.ts` rather than from
 * `services/buckets_service.ts`, so this module does not depend on the service it replaces.
 */

function bucketItemHasMeasureDateFilter(bucketItem: IRawBucketItem): boolean {
    const filters = bucketItem.filters;
    return (filters?.length ?? 0) > 0 && filters.some(isDateItem);
}

export function hasDerivedMeasureAsOperand(
    bucketItem: IRawBucketItem,
    bucketItems: IRawBucketItems,
): boolean {
    if (isValidArithmeticMeasure(bucketItem)) {
        const operandBucketItems = getOperandLocalIdentifiers(bucketItem).map(
            (operandLocalIdentifier: string) =>
                bucketItems.find(
                    (candidate: IRawBucketItem) => candidate.localIdentifier === operandLocalIdentifier,
                ),
        );

        return operandBucketItems.some(
            (operand: IRawBucketItem) =>
                isDerived(operand) || hasDerivedMeasureAsOperand(operand, bucketItems),
        );
    }

    return false;
}

/**
 * The compatible subset of `masterMeasures`. `buckets` is read only to resolve the arithmetic
 * measures' operands, which may live in any bucket.
 */
export function filterCompatibleMeasures(
    masterMeasures: IRawBucketItems,
    buckets: IRawBuckets,
): IRawBucketItems {
    const bucketItems = getMeasuresInBuckets(buckets);
    return masterMeasures
        .filter((bucketItem: IRawBucketItem) => !bucketItemHasMeasureDateFilter(bucketItem))
        .filter(
            (bucketItem: IRawBucketItem) =>
                !isArithmeticMeasure(bucketItem) ||
                (isValidArithmeticMeasure(bucketItem) &&
                    !hasDerivedMeasureAsOperand(bucketItem, bucketItems)),
        );
}

/**
 * Is EVERY compatible measure of the reference point already comparing over time? The question the
 * arithmetic-measure operand change asks before it creates a derived measure of its own.
 *
 * `refPointMeasures` are ALL the measures of the reference point's buckets; the derived / master
 * split happens here, so the caller flattens the buckets once (`refPointBuckets` is still needed for
 * the operand lookup inside {@link filterCompatibleMeasures}).
 */
export function areAllSelectedCompatible(
    refPointBuckets: IRawBuckets,
    refPointMeasures: IRawBucketItems,
): boolean {
    const derivedMeasures = refPointMeasures.filter(isDerived);
    const compatibleMeasures = filterCompatibleMeasures(
        refPointMeasures.filter((measure) => !isDerived(measure)),
        refPointBuckets,
    );

    return derivedMeasures.length > 0 && derivedMeasures.length === compatibleMeasures.length;
}

/**
 * The reference point's derived measures whose MASTER is still among the buckets' measures.
 *
 * The two collections come from different places on purpose, and the asymmetry is worth naming: the
 * derived candidates are the REFERENCE POINT's (what the plug viz last saw), the masters are the
 * BUCKETS' (what AD holds now). A caller mid-gesture therefore asks about the buckets it has just
 * built against the reference point as it still stands — which is exactly what the add operation needs.
 */
export function getCompatibleDerivedMeasuresInBuckets(
    buckets: IRawBuckets,
    refPointBuckets: IRawBuckets,
): IRawBucketItems {
    const bucketMeasures = getMeasuresInBuckets(buckets);

    return getMeasuresInBuckets(refPointBuckets).filter(
        (derivedMeasure: IRawBucketItem) =>
            isDerived(derivedMeasure) &&
            bucketMeasures.some((masterMeasure: IRawBucketItem) =>
                isDerivedFrom(derivedMeasure, masterMeasure),
            ),
    ) as IRawBucketItems;
}

/**
 * Which over-time comparison a newly added measure should adopt: the one the existing derived measures
 * already use, provided the visualization supports it. `NOTHING` otherwise.
 *
 * `supportedTypes` is the extended reference point's uiConfig list, resolved by the caller — the value
 * level of `services/buckets_service.ts#getSelectedOverTimeComparisonType`, which stays the whole-root
 * entry point over this implementation (the 4.10 rule).
 */
export function getSelectedOverTimeComparisonTypeInBuckets(
    buckets: IRawBuckets,
    refPointBuckets: IRawBuckets,
    supportedTypes: OverTimeComparisonType[],
): OverTimeComparisonType {
    const [derivedMeasure] = getCompatibleDerivedMeasuresInBuckets(buckets, refPointBuckets);
    const comparisonType = derivedMeasure?.overTimeComparisonType as OverTimeComparisonType;

    return comparisonType && supportedTypes.includes(comparisonType)
        ? comparisonType
        : OverTimeComparisonTypes.NOTHING;
}

/**
 * Queues a derived measure for the master measure, for the plug viz to place on the next round trip.
 * `NOTHING` is not a comparison: the queue is answered UNCHANGED — the same no-op the
 * whole-root version expressed by returning the state it was given.
 */
export function createAndAddNewDerivedMeasure(
    pluggableVisualization: IPluggableVisualizationState | undefined,
    bucketItem: IRawBucketItem,
    comparisonType: OverTimeComparisonType,
): IPluggableVisualizationState {
    if (comparisonType === OverTimeComparisonTypes.NOTHING) {
        return pluggableVisualization;
    }

    return appendNewDerivedBucketItem(
        pluggableVisualization,
        createDerivedMeasure(bucketItem, comparisonType),
    );
}

// --- setting one measure's over-time comparison -----------------------------------------

/**
 * SETTING A MEASURE'S OVER-TIME COMPARISON — the second wide pure cross-domain calculation of the
 * buckets cluster.
 *
 * Four branches, and they are not variations of one write — they are four different transactions:
 *
 * 1. **turning the comparison OFF** removes the master's derived measures, with everything that
 *    depends on THEM, then re-sanitizes the totals and the sort items;
 * 2. **turning it on with no derived measure yet** does not touch the buckets at all: it QUEUES a
 *    derived measure for the pluggable visualization to place on the next round trip;
 * 3. **changing the comparison TYPE** rebuilds the derived measure (the local identifier encodes the
 *    type), re-points the totals and the ranking filter at the new identifier, inserts it next to the
 *    master and removes the old one;
 * 4. **setting the type it already has** is a no-op and answers every input by reference.
 *
 * WHY THIS RESULT CARRIES THE REFERENCE POINT, unlike {@link removeBucketItemsWithDependencies}:
 * branches 1 and 3 run the removal chain, whose tail re-syncs the reference point and clears
 * `isVisualizationMdObjectValid` — and then the branch CONTINUES, re-sanitizing totals and sort items
 * afterwards. So the sync happens in the MIDDLE of this operation, not at its end, and the observable
 * consequence is that `referencePoint.buckets` holds the buckets from before the second
 * `sanitizeTotals`: deep-equal to `data.buckets`, but a different reference. Moving the sync to the
 * end would change identity.
 *
 * `isVisualizationMdObjectValid` is carried through as a plain value rather than an optional
 * "write this" instruction: the branches that run the tail answer `false`, the others answer what
 * they were given, so an unchanged flag is an unchanged primitive and the write is a no-op.
 */
export interface ISetOverTimeComparisonInput {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

export interface ISetOverTimeComparisonParams {
    measure: IRawBucketItem;
    isEnabled: boolean;
    targetType: OverTimeComparisonType;
}

/**
 * The removal deps PLUS the reference-point sync's two foreign facts — the sync runs in the MIDDLE of
 * two of the four branches, so this operation owns it (see the note above). The pair was declared here
 * lives in `reference_point_sync.ts`, where every operation needs it.
 */
export interface ISetOverTimeComparisonDeps extends IRemoveBucketItemsDeps, IReferencePointSyncDeps {}

export interface ISetOverTimeComparisonResult {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

/** The removal chain PLUS the reference-point sync tail that runs at the end of it. */
function removeBucketItemsAndSyncReferencePoint(
    input: ISetOverTimeComparisonInput,
    localIdentifiers: string[],
    notifyOnlyAboutRemovedDependencies: boolean,
    deps: ISetOverTimeComparisonDeps,
): ISetOverTimeComparisonResult {
    const removal = removeBucketItemsWithDependencies(
        input,
        { localIdentifiers, notifyOnlyAboutRemovedDependencies },
        deps,
    );

    return {
        ...removal,
        pluggableVisualization: input.pluggableVisualization,
        referencePoint: syncReferencePointForBuckets(
            input.referencePoint,
            removal.buckets,
            removal.filterBar,
            removal.bucketsMeta,
            deps,
        ),
        isVisualizationMdObjectValid: false,
    };
}

/** Branch 1 — the comparison is turned off, or set to `NOTHING`, which is the same thing. */
function removeDerivedMeasuresOfMaster(
    input: ISetOverTimeComparisonInput,
    measure: IRawBucketItem,
    deps: ISetOverTimeComparisonDeps,
): ISetOverTimeComparisonResult {
    const derivedLocalIdentifiers = [...(findDerivedBucketItemsInBuckets(input.buckets, measure) ?? [])].map(
        (derivedItem: IRawBucketItem) => derivedItem?.localIdentifier,
    );

    const removal = removeBucketItemsAndSyncReferencePoint(input, derivedLocalIdentifiers, false, deps);

    // the SECOND sanitizeTotals of this branch, against the buckets as they were on ENTRY — the one
    // inside the removal compared the same `previous` value, so this is not a nested comparison
    const buckets = sanitizeTotals(input.buckets, removal.buckets, {
        reorderByMeasures: deps.reorderByMeasures,
    });

    return {
        ...removal,
        buckets,
        extendedReferencePoint: validateVisualizationProperties(removal.extendedReferencePoint, buckets),
    };
}

/** Branch 2 — nothing derived exists yet, so the plug viz is asked to place one. */
function queueNewDerivedMeasure(
    input: ISetOverTimeComparisonInput,
    measure: IRawBucketItem,
    targetType: OverTimeComparisonType,
): ISetOverTimeComparisonResult {
    return {
        ...input,
        pluggableVisualization: appendNewDerivedBucketItem(
            input.pluggableVisualization,
            createDerivedMeasure(measure, targetType),
        ),
        extendedReferencePoint: validateVisualizationProperties(input.extendedReferencePoint, input.buckets),
    };
}

/**
 * Inserts the rebuilt derived measure next to its master. Identity when the old derived measure is not
 * in any bucket — which is also the signal to skip the removal entirely (see branch 3).
 */
export function insertReplacementDerivedMeasure(
    buckets: IRawBuckets,
    previousDerivedItem: IRawBucketItem,
    newDerivedItem: IRawBucketItem,
): IRawBuckets {
    const { bucket } = getBucketItemIndexInBuckets(buckets, previousDerivedItem?.localIdentifier);
    if (!bucket) {
        return buckets;
    }

    const bucketIndex = getBucketIndexInBuckets(buckets, bucket?.localIdentifier);
    const insertionIndex = findReplacedBucketItemInsertionIndex(previousDerivedItem, bucket, bucket);

    return updateBucketItemsAt(buckets, bucketIndex, () =>
        insertBucketItem(bucket?.items, insertionIndex, newDerivedItem),
    );
}

/** Branch 3 — the comparison type changed, so the derived measure is rebuilt and swapped in. */
function replaceDerivedMeasureForNewType(
    input: ISetOverTimeComparisonInput,
    previousDerivedItem: IRawBucketItem,
    measure: IRawBucketItem,
    targetType: OverTimeComparisonType,
    deps: ISetOverTimeComparisonDeps,
): ISetOverTimeComparisonResult {
    const newDerivedItem = transformDerivedMeasure(previousDerivedItem, measure, targetType);
    const previousLocalIdentifier = previousDerivedItem?.localIdentifier;

    const bucketsWithTotalsRepointed = replaceDerivedTotalItems(
        input.buckets,
        previousDerivedItem,
        newDerivedItem,
    );
    const filterBarWithRankingRepointed = replaceRankingFilterMeasure(
        input.filterBar,
        previousLocalIdentifier,
        newDerivedItem?.localIdentifier,
    );

    const bucketsWithReplacement = insertReplacementDerivedMeasure(
        bucketsWithTotalsRepointed,
        previousDerivedItem,
        newDerivedItem,
    );

    // Bail out here — before the removal AND before the tail — when the item being replaced turns out
    // not to be in any bucket, KEEPING the totals and ranking re-pointing already applied.
    // Unreachable from this branch (the derived item was just found among the measures), but kept
    // because it is a guard about the buckets, not about this operation.
    if (bucketsWithReplacement === bucketsWithTotalsRepointed) {
        return {
            ...input,
            buckets: bucketsWithTotalsRepointed,
            filterBar: filterBarWithRankingRepointed,
            extendedReferencePoint: validateVisualizationProperties(
                input.extendedReferencePoint,
                bucketsWithTotalsRepointed,
            ),
        };
    }

    const removal = removeBucketItemsAndSyncReferencePoint(
        { ...input, buckets: bucketsWithReplacement, filterBar: filterBarWithRankingRepointed },
        [previousLocalIdentifier],
        true,
        deps,
    );

    return {
        ...removal,
        extendedReferencePoint: validateVisualizationProperties(
            removal.extendedReferencePoint,
            removal.buckets,
        ),
    };
}

export function setBucketItemOverTimeComparison(
    input: ISetOverTimeComparisonInput,
    { measure, isEnabled, targetType }: ISetOverTimeComparisonParams,
    deps: ISetOverTimeComparisonDeps,
): ISetOverTimeComparisonResult {
    if (!isEnabled || targetType === OverTimeComparisonTypes.NOTHING) {
        return removeDerivedMeasuresOfMaster(input, measure, deps);
    }

    const previousDerivedItem = findDerivedMeasure(measure, getMeasuresInBuckets(input.buckets));

    if (!previousDerivedItem) {
        return queueNewDerivedMeasure(input, measure, targetType);
    }

    if (previousDerivedItem?.overTimeComparisonType !== targetType) {
        return replaceDerivedMeasureForNewType(input, previousDerivedItem, measure, targetType, deps);
    }

    // branch 4: already comparing over exactly this period — every input answered by reference
    return { ...input, extendedReferencePoint: input.extendedReferencePoint };
}

/**
 * A DATE FILTER'S over-time-comparison consequence for EVERY master measure. The date-filter and
 * metric-filter operations call it when their payload carries `overTimeComparisonMeasures`.
 *
 * Two shapes:
 *
 * - `NOTHING` removes ALL derived measures in ONE removal pass (with the removal's mid-operation
 *   reference-point sync), then re-sanitizes the totals against the buckets as they were ON ENTRY
 *   and re-validates the sort items;
 * - any other type runs {@link setBucketItemOverTimeComparison} once per master measure, threading
 *   each result into the next input. The master list is snapshotted from the ENTRY buckets, so a
 *   measure added mid-fold does not join the fold.
 */
export function updateDerivedMeasuresOverTime(
    input: ISetOverTimeComparisonInput,
    overTimeComparisonMeasures: ReadonlyArray<string>,
    targetType: OverTimeComparisonType,
    deps: ISetOverTimeComparisonDeps,
): ISetOverTimeComparisonResult {
    if (targetType === OverTimeComparisonTypes.NOTHING) {
        const derivedLocalIdentifiers = [...(getDerivedBucketItemsInBuckets(input.buckets) ?? [])].map(
            (derivedItem: IRawBucketItem) => derivedItem?.localIdentifier,
        );
        const removal = removeBucketItemsAndSyncReferencePoint(input, derivedLocalIdentifiers, false, deps);
        const buckets = sanitizeTotals(input.buckets, removal.buckets, {
            reorderByMeasures: deps.reorderByMeasures,
        });

        return {
            ...removal,
            buckets,
            extendedReferencePoint: validateVisualizationProperties(removal.extendedReferencePoint, buckets),
        };
    }

    return getMeasuresInBuckets(input.buckets)
        .filter((measure: IRawBucketItem) => !isDerived(measure))
        .reduce<ISetOverTimeComparisonResult>(
            (current, measure) =>
                setBucketItemOverTimeComparison(
                    current,
                    {
                        measure,
                        isEnabled: overTimeComparisonMeasures.includes(getLocalIdentifier(measure)),
                        targetType,
                    },
                    deps,
                ),
            { ...input, extendedReferencePoint: input.extendedReferencePoint },
        );
}
