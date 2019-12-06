// (C) 2019 GoodData Corporation
import { bucketItems, IInsight, insightBucket } from "@gooddata/sdk-model";
import * as BucketNames from "../../../../base/constants/bucketNames";
import { isBarChart } from "../../../../highcharts/utils/common";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import get = require("lodash/get");

export function countBucketItems(insight: IInsight) {
    const viewBucket = insightBucket(insight, BucketNames.VIEW);
    const measureBucket = insightBucket(insight, BucketNames.MEASURES);
    const secondaryMeasureBucket = insightBucket(insight, BucketNames.SECONDARY_MEASURES);

    return {
        viewByItemCount: viewBucket ? bucketItems(viewBucket).length : 0,
        measureItemCount: measureBucket ? bucketItems(measureBucket).length : 0,
        secondaryMeasureItemCount: secondaryMeasureBucket ? bucketItems(secondaryMeasureBucket).length : 0,
    };
}

export function countItemsOnAxes(type: string, controls: IVisualizationProperties, insight: IInsight) {
    const isBarChartType = isBarChart(type);

    const { viewByItemCount, measureItemCount, secondaryMeasureItemCount } = countBucketItems(insight);
    const totalMeasureItemCount = measureItemCount + secondaryMeasureItemCount;

    const secondaryMeasureCountInConfig = (isBarChartType
        ? get(controls, "secondary_xaxis.measures", [])
        : get(controls, "secondary_yaxis.measures", [])
    ).length;

    if (isBarChartType) {
        return {
            yaxis: viewByItemCount,
            xaxis: totalMeasureItemCount - secondaryMeasureCountInConfig,
            secondary_xaxis: secondaryMeasureCountInConfig,
        };
    }

    return {
        xaxis: viewByItemCount,
        yaxis: totalMeasureItemCount - secondaryMeasureCountInConfig,
        secondary_yaxis: secondaryMeasureCountInConfig,
    };
}
