// (C) 2019-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import every from "lodash/every.js";
import { BucketNames } from "@gooddata/sdk-ui";
import { IBucketItem, IExtendedReferencePoint } from "../../../interfaces/Visualization.js";
import { METRIC, BUCKETS } from "../../../constants/bucket.js";
import {
    isDerivedBucketItem,
    findDerivedBucketItems,
    findMasterBucketItem,
    findMasterBucketItems,
} from "../../../utils/bucketHelper.js";

export function findSecondMasterMeasure(allMeasures: IBucketItem[]): IBucketItem {
    const masterBucketItems = findMasterBucketItems(allMeasures);
    return masterBucketItems.length > 1 ? masterBucketItems[1] : null;
}

export function tryToMapForeignBuckets(
    extendedReferencePoint: Readonly<IExtendedReferencePoint>,
): IExtendedReferencePoint {
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

        const targetBucketUiConfig = newReferencePoint.uiConfig.buckets[targetBucket.localIdentifier];
        if (!targetBucketUiConfig?.enabled) {
            allMeasuresCompatible = false;
            continue;
        }

        const measuresFitToLimit = sourceBucket.items.length <= targetBucketUiConfig.itemsLimit;
        if (!measuresFitToLimit) {
            allMeasuresCompatible = false;
            continue;
        }

        const isCompatibleMeasureType = every(sourceBucket.items, (item) => item.type === METRIC);
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
    secondaryMeasure?: IBucketItem,
): IExtendedReferencePoint {
    const newReferencePoint: IExtendedReferencePoint = cloneDeep(extendedReferencePoint);

    newReferencePoint[BUCKETS] = [
        {
            localIdentifier: BucketNames.MEASURES,
            items: primaryMeasure ? [primaryMeasure] : [],
        },
        {
            localIdentifier: BucketNames.SECONDARY_MEASURES,
            items: secondaryMeasure ? [secondaryMeasure] : [],
        },
    ];

    return newReferencePoint;
}

export function findComplementaryOverTimeComparisonMeasure(
    primaryMeasure: IBucketItem,
    allMeasures: IBucketItem[],
): IBucketItem {
    if (!primaryMeasure) {
        return null;
    }

    if (isDerivedBucketItem(primaryMeasure)) {
        return findMasterBucketItem(primaryMeasure, allMeasures) || null;
    }

    const derivedOfPrimaryMeasure = findDerivedBucketItems(primaryMeasure, allMeasures);
    return derivedOfPrimaryMeasure.length > 0 ? derivedOfPrimaryMeasure[0] : null;
}
