// (C) 2026 GoodData Corporation

import { type IReferencePointState } from "../store/reference_point/reference_point_state.js";
import { type IRawBucket } from "../typings/buckets.js";

import { withReplacedBucket } from "./buckets_builder.test.helpers.js";

/**
 * TYPED patching of `data.referencePoint` for test fixtures.
 *
 * The reference point carries its OWN copy of the buckets — the one the pluggable-visualization round
 * trip is compared against — so a fixture that seeds buckets usually has to seed them here too, and
 * that is what this says.
 *
 * TEST-ONLY, and named so.
 */

/**
 * ONE bucket of the copy the reference point carries.
 *
 * IDENTITY is preserved when the bucket is already the one in that slot, matching the rest of the
 * builder family: `withReplacedBucket` answers the same collection for a no-op, and rebuilding the
 * reference point around it would make that no-op observable as a state write.
 */
export const withReferencePointBucket = (
    referencePoint: IReferencePointState,
    bucketIndex: number,
    bucket: IRawBucket,
): IReferencePointState => {
    const buckets = withReplacedBucket(referencePoint?.buckets ?? [], bucketIndex, bucket);

    return buckets === referencePoint?.buckets ? referencePoint : { ...referencePoint, buckets };
};
