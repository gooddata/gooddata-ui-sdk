// (C) 2007-2026 GoodData Corporation

import { isEqual } from "lodash-es";

import { type ITotal } from "@gooddata/sdk-model";

import { ATTRIBUTE, COLUMNS } from "../../constants/bucket.js";
import { getLocalIdentifier, isDerivedFrom } from "../../models/bucket_item.js";
import { type IRawBucket, type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type IBucketItem } from "../../typings/metadata.js";

import { getBucketIndexInBuckets, updateBucketAt, updateEveryBucket } from "./bucket_item_address.js";
import {
    getBucketAttributesInBuckets,
    getBucketTotalsInBuckets,
    getMeasuresInBuckets,
} from "./buckets_read_helpers.js";
import { getTotalsForMeasureEnabledOnAllOtherMeasures } from "./helpers/totals_for_new_measure.js";
import { sanitizeBucketTotals } from "./helpers/totals_sanitization.js";

/**
 * Totals as narrow pure helpers over a buckets value. The RULES live in
 * `helpers/totals_sanitization.ts` and `helpers/totals_for_new_measure.ts`; this module applies them
 * TO the buckets subtree, every entry point being `(buckets, …explicitArgs) => IRawBuckets`.
 *
 * TWO IDEMPOTENCE GUARDS are load-bearing:
 *
 * - {@link setBucketTotals} compares the totals it is given against the ones already there and
 *   answers the ORIGINAL buckets when they are deep-equal. Without it every totals write rebuilds the
 *   bucket, and this transformer runs on paths that fire per render;
 * - {@link mirrorTotalsToDerivedMeasures} compares the whole rebuilt collection, because it cannot
 *   know per-bucket whether it changed anything until it has mirrored — that deep compare IS its
 *   no-op signal.
 *
 * The writes themselves go through the identity-preserving bucket operations in
 * `bucket_item_address.ts`, so a bucket whose totals did not move keeps its reference.
 *
 * {@link sanitizeTotals} takes TWO buckets values on purpose. Dropping the PREVIOUS one silently
 * breaks the totals re-pointing table: a grand total follows the first attribute wherever it moved,
 * which is only answerable by comparing before with after.
 */

/**
 * THE THREE TOTALS WRITES every transformer below is built from. Each answers the value it was given
 * when nothing changed, so a bucket whose totals did not move keeps its reference and the buckets
 * array around it is never rebuilt.
 */
function setBucketTotalsValue(bucket: IRawBucket, totals: ITotal[]): IRawBucket {
    if (bucket?.totals === totals) {
        return bucket;
    }
    return { ...bucket, totals };
}

function removeBucketTotals(bucket: IRawBucket): IRawBucket {
    if (!bucket || !("totals" in bucket)) {
        return bucket;
    }
    const { totals: _removed, ...bucketWithoutTotals } = bucket;
    return bucketWithoutTotals;
}

/** Points one total at another measure. Identity when it already targets it. */
function retargetTotal(total: ITotal, measureIdentifier: string): ITotal {
    if (total?.measureIdentifier === measureIdentifier) {
        return total;
    }
    return { ...total, measureIdentifier };
}

/**
 * Applies an update to every total of one bucket, keeping the totals array when none of them changed
 * — the lazy copy `Array.prototype.map` cannot give.
 */
function updateEveryTotal(totals: ITotal[], updater: (total: ITotal) => ITotal): ITotal[] {
    let nextTotals: ITotal[] | undefined;

    for (let i = 0; i < totals.length; i += 1) {
        const total = totals[i];
        const nextTotal = updater(total);
        if (nextTotal !== total) {
            nextTotals ??= totals.slice();
            nextTotals[i] = nextTotal;
        }
    }

    return nextTotals ?? totals;
}

/**
 * Exported because the whole-root adapter needs the CONTROL FLOW, not just the value: "the totals
 * were already these" and "the write changed nothing" are different one step up, where only the
 * second still re-syncs the reference point. Identity of the returned buckets cannot express that
 * difference on its own — a write addressing a bucket that does not exist also changes nothing, and
 * there the sync DOES run. So the guard is a predicate the adapter can ask.
 */
export function areBucketTotalsIdentical(
    buckets: IRawBuckets,
    totals: unknown,
    bucketLocalIdentifier: string,
): boolean {
    const affectedBucket = buckets.find(
        (bucket: IRawBucket) => bucket?.localIdentifier === bucketLocalIdentifier,
    );

    return isEqual(affectedBucket?.totals, totals);
}

/**
 * Replaces one bucket's totals. Identity on a falsy payload and on deep-equal totals, guarded
 * explicitly.
 */
export function setBucketTotals(
    buckets: IRawBuckets,
    totals: ITotal[] | undefined,
    bucketLocalIdentifier: string,
): IRawBuckets {
    if (!totals || areBucketTotalsIdentical(buckets, totals, bucketLocalIdentifier)) {
        return buckets;
    }

    return updateEveryBucket(buckets, (bucket: IRawBucket) =>
        bucket?.localIdentifier === bucketLocalIdentifier ? setBucketTotalsValue(bucket, totals) : bucket,
    );
}

function removeTotalsFromBucket(buckets: IRawBuckets, bucketLocalIdentifier: string): IRawBuckets {
    return updateBucketAt(
        buckets,
        getBucketIndexInBuckets(buckets, bucketLocalIdentifier),
        removeBucketTotals,
    );
}

function setTotalsToBucket(
    buckets: IRawBuckets,
    totals: ITotal[],
    bucketLocalIdentifier: string,
): IRawBuckets {
    const bucketIndex = getBucketIndexInBuckets(buckets, bucketLocalIdentifier);
    if (bucketIndex < 0) {
        // noop if bucket not found
        return buckets;
    }

    return updateBucketAt(buckets, bucketIndex, (bucket) =>
        totals.length === 0 ? removeBucketTotals(bucket) : setBucketTotalsValue(bucket, totals),
    );
}

function appendTotalsToBucket(
    buckets: IRawBuckets,
    totals: ITotal[],
    bucketLocalIdentifier: string,
): IRawBuckets {
    if (totals.length === 0) {
        return buckets;
    }

    return updateEveryBucket(buckets, (bucket: IRawBucket) =>
        bucket?.localIdentifier === bucketLocalIdentifier
            ? setBucketTotalsValue(bucket, (bucket.totals as ITotal[]).concat(totals))
            : bucket,
    );
}

/**
 * Re-points and prunes the row/column totals after a buckets mutation.
 *
 * @param previousBuckets - the buckets BEFORE the mutation; the re-pointing table needs them
 * @param currentBuckets - the buckets after the mutation, which is what gets rewritten
 * @param reorderByMeasures - `enableNewPivotTable`; totals is a pivot-table-only concern, so the
 *   visualization-specific flag is legitimate here — it arrives named rather than read from a store
 */
export function sanitizeTotals(
    previousBuckets: IRawBuckets,
    currentBuckets: IRawBuckets,
    { reorderByMeasures }: { reorderByMeasures: boolean },
): IRawBuckets {
    const measures: IBucketItem[] = getMeasuresInBuckets(currentBuckets) as IBucketItem[];

    const previousRowAttributes = getBucketAttributesInBuckets(previousBuckets, ATTRIBUTE);
    const rowAttributes = getBucketAttributesInBuckets(currentBuckets, ATTRIBUTE);
    const previousColAttributes = getBucketAttributesInBuckets(previousBuckets, COLUMNS);
    const colAttributes = getBucketAttributesInBuckets(currentBuckets, COLUMNS);

    let result = currentBuckets;

    if (rowAttributes.length === 0 || measures.length === 0) {
        result = removeTotalsFromBucket(result, ATTRIBUTE);
    }

    if (colAttributes.length === 0 || measures.length === 0) {
        result = removeTotalsFromBucket(result, COLUMNS);
    }

    const rowTotals = sanitizeBucketTotals(
        getBucketTotalsInBuckets(result, ATTRIBUTE),
        rowAttributes,
        previousRowAttributes,
        measures,
        reorderByMeasures,
    );
    const colTotals = sanitizeBucketTotals(
        getBucketTotalsInBuckets(result, COLUMNS),
        colAttributes,
        previousColAttributes,
        measures,
        reorderByMeasures,
    );

    const updatedRows = setTotalsToBucket(result, rowTotals, ATTRIBUTE);
    return setTotalsToBucket(updatedRows, colTotals, COLUMNS);
}

/**
 * Copies each total that targets `derivedMeasureAddedToItem` onto the measure derived from it, so a
 * new derived measure inherits the totals its master already has.
 *
 * Identity on a no-op is a DEEP compare, not a per-bucket guard: the mirroring has to run before it
 * is knowable whether anything moved. Load-bearing, because this runs whenever a derived measure is
 * placed.
 */
export function mirrorTotalsToDerivedMeasures(
    buckets: IRawBuckets,
    derivedMeasureAddedToItem: IRawBucketItem,
): IRawBuckets {
    const measures = getMeasuresInBuckets(buckets);

    const bucketsWithTotalsMirrored = updateEveryBucket(buckets, (bucket: IRawBucket) => {
        const bucketTotals = bucket?.totals;
        if (!bucketTotals?.length) {
            return bucket;
        }

        const mirrored: ITotal[] = [];
        for (const total of bucketTotals) {
            const totalMeasureIdentifier = total?.["measureIdentifier"];
            if (totalMeasureIdentifier === getLocalIdentifier(derivedMeasureAddedToItem)) {
                const derivedMeasure = measures.find((measure: IRawBucketItem) =>
                    isDerivedFrom(measure, derivedMeasureAddedToItem),
                );

                if (derivedMeasure) {
                    mirrored.push(retargetTotal(total as ITotal, getLocalIdentifier(derivedMeasure)));
                }
            }

            mirrored.push(total as ITotal);
        }

        return setBucketTotalsValue(bucket, mirrored);
    });

    // the deep-equality guard is EXPLICIT: nothing else makes this transformer idempotent
    return isEqual(buckets, bucketsWithTotalsMirrored) ? buckets : bucketsWithTotalsMirrored;
}

function addTotalsEnabledForAllMeasuresToNewMeasureForBucket(
    buckets: IRawBuckets,
    newMeasure: IRawBucketItem,
    bucketLocalIdentifier: string,
): IRawBuckets {
    const totals = getBucketTotalsInBuckets(buckets, bucketLocalIdentifier);
    if (totals.length === 0) {
        return buckets;
    }

    const measureLocalIdentifier = newMeasure?.localIdentifier;
    const previousMeasureLocalIdentifiers = [...(getMeasuresInBuckets(buckets) ?? [])]
        .map((measure: IRawBucketItem) => measure?.localIdentifier)
        .filter((localIdentifier: string) => localIdentifier !== measureLocalIdentifier);

    const newMeasureTotals = getTotalsForMeasureEnabledOnAllOtherMeasures(
        measureLocalIdentifier,
        totals,
        previousMeasureLocalIdentifiers,
    );

    return appendTotalsToBucket(buckets, newMeasureTotals, bucketLocalIdentifier);
}

/**
 * A measure dropped into a bucket whose OTHER measures all have a given total enabled gets that total
 * too. Applied to the row and column buckets in turn.
 */
export function addTotalsEnabledForAllMeasuresToNewMeasure(
    buckets: IRawBuckets,
    newMeasure: IRawBucketItem,
): IRawBuckets {
    const withRowTotals = addTotalsEnabledForAllMeasuresToNewMeasureForBucket(buckets, newMeasure, ATTRIBUTE);
    return addTotalsEnabledForAllMeasuresToNewMeasureForBucket(withRowTotals, newMeasure, COLUMNS);
}

/** Re-points every total of the old derived measure at the new one (the comparison-type change). */
export function replaceDerivedTotalItems(
    buckets: IRawBuckets,
    oldDerivedItem: IRawBucketItem,
    newDerivedItem: IRawBucketItem,
): IRawBuckets {
    return updateEveryBucket(buckets, (bucket: IRawBucket) => {
        const totals = bucket?.totals;
        if ((totals?.length ?? 0) > 0) {
            const updatedTotals = updateEveryTotal(totals as ITotal[], (totalItem: ITotal) =>
                totalItem?.measureIdentifier === oldDerivedItem?.localIdentifier
                    ? retargetTotal(totalItem, newDerivedItem?.localIdentifier)
                    : totalItem,
            );

            return setBucketTotalsValue(bucket, updatedTotals);
        }
        return bucket;
    });
}
