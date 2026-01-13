// (C) 2019-2025 GoodData Corporation
import { cloneDeep } from "lodash-es";

import { BucketNames } from "@gooddata/sdk-ui";

import { BUCKETS, METRIC } from "../../../constants/bucket.js";
import { type IBucketItem, type IExtendedReferencePoint } from "../../../interfaces/Visualization.js";
import {
    findDerivedBucketItems,
    findMasterBucketItem,
    findMasterBucketItems,
    isDerivedBucketItem,
} from "../../../utils/bucketHelper.js";

export function findSecondMasterMeasure(allMeasures: IBucketItem[]): IBucketItem | null {
    const masterBucketItems = findMasterBucketItems(allMeasures);
    return masterBucketItems.length > 1 ? masterBucketItems[1] : null;
}

export function tryToMapForeignBuckets(
    extendedReferencePoint: Readonly<IExtendedReferencePoint>,
): IExtendedReferencePoint | null {
    const newReferencePoint = setHeadlineRefPointBuckets(extendedReferencePoint);
    const totalBuckets = extendedReferencePoint.buckets.length;
    let allMeasuresCompatible = true;
    let bucketIndex = -1;

    while (allMeasuresCompatible && ++bucketIndex < totalBuckets) {
        const sourceBucket = extendedReferencePoint.buckets[bucketIndex];
        const targetBucket = newReferencePoint[BUCKETS][bucketIndex];
        if (!targetBucket) {
            if (sourceBucket.items.length) {
                allMeasuresCompatible = false;
            }
            continue;
        }

        const targetBucketUiConfig = newReferencePoint.uiConfig?.buckets[targetBucket.localIdentifier];
        if (!targetBucketUiConfig?.enabled) {
            allMeasuresCompatible = false;
            continue;
        }

        const measuresFitToLimit = sourceBucket.items.length <= targetBucketUiConfig.itemsLimit!;
        if (!measuresFitToLimit) {
            allMeasuresCompatible = false;
            continue;
        }

        const isCompatibleMeasureType = sourceBucket.items.every((item) => item.type === METRIC);
        if (!isCompatibleMeasureType) {
            allMeasuresCompatible = false;
            continue;
        }

        targetBucket.items = sourceBucket.items;
    }

    return allMeasuresCompatible ? newReferencePoint : null;
}

export function setHeadlineRefPointBuckets(
    extendedReferencePoint: Readonly<IExtendedReferencePoint>,
    primaryMeasure?: IBucketItem,
    secondaryMeasure?: IBucketItem[],
): IExtendedReferencePoint {
    const newReferencePoint: IExtendedReferencePoint = cloneDeep(extendedReferencePoint);

    newReferencePoint[BUCKETS] = [
        {
            localIdentifier: BucketNames.MEASURES,
            items: primaryMeasure ? [primaryMeasure] : [],
        },
        {
            localIdentifier: BucketNames.SECONDARY_MEASURES,
            items: secondaryMeasure || [],
        },
    ];

    return newReferencePoint;
}

export function findComplementaryOverTimeComparisonMeasure(
    primaryMeasure: IBucketItem | null,
    allMeasures: IBucketItem[],
): IBucketItem | null {
    if (!primaryMeasure) {
        return null;
    }

    if (isDerivedBucketItem(primaryMeasure)) {
        return findMasterBucketItem(primaryMeasure, allMeasures) ?? null;
    }

    const derivedOfPrimaryMeasure = findDerivedBucketItems(primaryMeasure, allMeasures);
    return derivedOfPrimaryMeasure.length > 0 ? derivedOfPrimaryMeasure[0] : null;
}
