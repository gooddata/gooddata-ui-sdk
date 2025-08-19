// (C) 2024-2025 GoodData Corporation

import { IInsightDefinition, bucketsFind, insightBuckets, isAttributeSort } from "@gooddata/sdk-model";
import { BucketNames, ChartType } from "@gooddata/sdk-ui";

import { IReferencePoint } from "../interfaces/Visualization.js";

export function isForecastEnabled(
    referencePoint: IReferencePoint | undefined,
    insight: IInsightDefinition | undefined,
    type: ChartType,
) {
    switch (type) {
        case "line": {
            return {
                enabled: lineChartBuckets(referencePoint, insight) && lineChartNotSorts(insight),
                visible: true,
            };
        }
        case "column":
        default:
            return {
                enabled: false,
                visible: false,
            };
    }
}

function lineChartBuckets(
    referencePoint: IReferencePoint | undefined,
    insight: IInsightDefinition | undefined,
) {
    //NOTE: No reference point, try to get it from
    // Keep on mind that we are not able to check if trends item is date
    // but this method is used on dashboard where is not necessary to be so strict
    if (!referencePoint) {
        const buckets = insightBuckets(insight);
        const measures = bucketsFind(buckets, (b) => b.localIdentifier === BucketNames.MEASURES);
        const trends = bucketsFind(buckets, (b) => b.localIdentifier === BucketNames.TREND);
        const segments = bucketsFind(buckets, (b) => b.localIdentifier === BucketNames.SEGMENT);

        return (
            measures?.items.length === 1 && trends?.items.length === 1 && (segments?.items.length ?? 0) === 0
        );
    }

    //NOTE: Only one measure and one trend bucket is allowed, trend bucket must be date
    const measures = referencePoint?.buckets.find((b) => b.localIdentifier === BucketNames.MEASURES);
    const trends = referencePoint?.buckets.find((b) => b.localIdentifier === BucketNames.TREND);
    const segments = referencePoint?.buckets.find((b) => b.localIdentifier === BucketNames.SEGMENT);

    return (
        measures?.items.length === 1 &&
        trends?.items.length === 1 &&
        (segments?.items.length ?? 0) === 0 &&
        trends?.items[0].type === "date"
    );
}

function lineChartNotSorts(insight: IInsightDefinition) {
    const { sorts } = insight.insight;

    //NOTE: No sort, can be forecast
    if (sorts.length === 0) {
        return true;
    }
    //NOTE: Only one sort, that is attribute and is asc, can be forecast
    if (sorts.length === 1) {
        const sort = sorts[0];

        if (isAttributeSort(sort) && sort.attributeSortItem.direction === "asc") {
            return true;
        }
    }

    //NOTE: More than one sort, can't be forecast
    return false;
}
