// (C) 2026 GoodData Corporation

import { type IInsightDefinition, bucketIsEmpty, insightBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type GeoChartShapeType } from "@gooddata/sdk-ui-geo";

import { getItemsCount } from "./bucketHelper.js";
import { type IBucketOfFun } from "../interfaces/Visualization.js";

function isPushpinIconShape(shapeType: GeoChartShapeType = "circle"): boolean {
    return shapeType === "iconByValue" || shapeType === "oneIcon";
}

function hasInsightBucketItems(insight: IInsightDefinition | undefined, bucketName: string): boolean {
    if (!insight) {
        return false;
    }

    const bucket = insightBucket(insight, bucketName);
    return bucket !== undefined && !bucketIsEmpty(bucket);
}

function hasReferencePointBucketItems(buckets: IBucketOfFun[], bucketName: string): boolean {
    return getItemsCount(buckets, bucketName) > 0;
}

export function hasPushpinSizeMeasure(insight: IInsightDefinition | undefined): boolean {
    return hasInsightBucketItems(insight, BucketNames.SIZE);
}

export function hasPushpinColorMeasure(insight: IInsightDefinition | undefined): boolean {
    return hasInsightBucketItems(insight, BucketNames.COLOR);
}

export function hasPushpinSegmentAttribute(insight: IInsightDefinition | undefined): boolean {
    return hasInsightBucketItems(insight, BucketNames.SEGMENT);
}

export function hasPushpinTooltipMetric(insight: IInsightDefinition | undefined): boolean {
    return hasInsightBucketItems(insight, BucketNames.MEASURES);
}

export function isPushpinClusteringEditable(
    insight: IInsightDefinition | undefined,
    shapeType: GeoChartShapeType = "circle",
): boolean {
    return (
        !hasPushpinSizeMeasure(insight) &&
        !hasPushpinColorMeasure(insight) &&
        !hasPushpinTooltipMetric(insight) &&
        !hasPushpinSegmentAttribute(insight) &&
        !isPushpinIconShape(shapeType)
    );
}

export function isPushpinClusteringEditableForBuckets(
    buckets: IBucketOfFun[],
    shapeType: GeoChartShapeType = "circle",
): boolean {
    return (
        !hasReferencePointBucketItems(buckets, BucketNames.SIZE) &&
        !hasReferencePointBucketItems(buckets, BucketNames.COLOR) &&
        !hasReferencePointBucketItems(buckets, BucketNames.MEASURES) &&
        !hasReferencePointBucketItems(buckets, BucketNames.SEGMENT) &&
        !isPushpinIconShape(shapeType)
    );
}

export function arePushpinSizeColorBucketsEditable(shapeType: GeoChartShapeType = "circle"): boolean {
    return !isPushpinIconShape(shapeType);
}
