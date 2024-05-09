// (C) 2024 GoodData Corporation

import { BucketNames, ChartType } from "@gooddata/sdk-ui";

import { IReferencePoint } from "../interfaces/Visualization.js";
import { IInsightDefinition, isAttributeSort } from "@gooddata/sdk-model";

export function isForecastEnabled(
    referencePoint: IReferencePoint | undefined,
    insight: IInsightDefinition | undefined,
    type: ChartType,
) {
    switch (type) {
        case "line": {
            return {
                enabled: lineChartBuckets(referencePoint) && lineChartNotSorts(insight),
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

function lineChartBuckets(referencePoint: IReferencePoint | undefined) {
    const measures = referencePoint?.buckets.find((b) => b.localIdentifier === BucketNames.MEASURES);
    const trends = referencePoint?.buckets.find((b) => b.localIdentifier === BucketNames.TREND);
    const segments = referencePoint?.buckets.find((b) => b.localIdentifier === BucketNames.SEGMENT);

    //NOTE: Only one measure and one trend bucket is allowed, trend bucket must be date
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
