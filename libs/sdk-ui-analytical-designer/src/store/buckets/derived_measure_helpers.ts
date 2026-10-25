// (C) 2007-2026 GoodData Corporation

import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { METRIC } from "../../constants/bucket.js";
import { getLocalIdentifier } from "../../models/bucket_item.js";
import { generateDerivedMeasureLocalIdentifier } from "../../models/bucket_item_identifier.js";
import { type IRawBucketItem } from "../../typings/buckets.js";

/**
 * The DERIVED MEASURE factories, value-level: each takes a bucket ITEM and answers a bucket ITEM.
 *
 * They live here rather than in `services/buckets_service.ts` for a layering reason:
 * `store/buckets/over_time_comparison_helpers.ts` needs `createDerivedMeasure`, and importing it
 * from the service whose whole-root operations those helpers replace would close an edge back onto
 * it.
 */

/**
 * A new derived (previous-period / same-period-last-year) measure for `masterBucketItem`.
 *
 * The literal is typed as the target `IRawBucketItem` instead of being cast to it afterwards, so
 * a literal that drifts from the item shape fails to compile.
 */
export function createDerivedMeasure(
    masterBucketItem: IRawBucketItem,
    overTimeComparisonType: OverTimeComparisonType,
): IRawBucketItem {
    const localIdentifier = getLocalIdentifier(masterBucketItem);

    return {
        type: METRIC,
        localIdentifier: generateDerivedMeasureLocalIdentifier(localIdentifier, overTimeComparisonType),
        attribute: masterBucketItem?.attribute,
        aggregation: masterBucketItem?.aggregation,
        showInPercent: masterBucketItem?.showInPercent,
        showOnSecondaryAxis: masterBucketItem?.showOnSecondaryAxis,
        isTotalMeasure: masterBucketItem?.isTotalMeasure,
        filters: [],
        masterLocalIdentifier: localIdentifier,
        overTimeComparisonType,
    };
}

/**
 * Re-derives a derived measure for a new comparison type, KEEPING the user's alias.
 *
 * It is a rebuild rather than a field edit because the local identifier encodes the comparison type
 * — which is also why the alias has to be carried over explicitly.
 */
export function transformDerivedMeasure(
    derivedItem: IRawBucketItem,
    masterItem: IRawBucketItem,
    targetType: OverTimeComparisonType,
): IRawBucketItem {
    const newDerivedItem = createDerivedMeasure(masterItem, targetType);
    // No identity guard: `newDerivedItem` was just built here, so there is no previous reference to
    // preserve — the alias is simply carried onto the new item.
    return { ...newDerivedItem, alias: derivedItem?.alias };
}
