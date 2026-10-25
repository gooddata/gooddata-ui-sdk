// (C) 2021-2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

let counter = 0;

export function generateBucketItemIdentifier() {
    if (window.useSafeBucketItemIdentifiersForE2e === true) {
        return `test_local_identifier_${counter++}`;
    }
    return uuid().replace(/-/g, "");
}

export function generateDerivedMeasureLocalIdentifier(
    masterMeasureLocalIdentifier: string,
    overTimeComparisonType: OverTimeComparisonType,
): string {
    switch (overTimeComparisonType) {
        case OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR:
            return `${masterMeasureLocalIdentifier}_pop`;
        case OverTimeComparisonTypes.PREVIOUS_PERIOD:
            return `${masterMeasureLocalIdentifier}_previous_period`;
        default:
            return `${masterMeasureLocalIdentifier}_unsupported_derived_measure`;
    }
}
