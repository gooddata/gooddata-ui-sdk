// (C) 2019-2025 GoodData Corporation

import {
    type IAttributeOrMeasure,
    type IInsightDefinition,
    bucketItems,
    insightBucket,
    isMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { isBarChart, isBubbleChart, isBulletChart, isScatterPlot } from "@gooddata/sdk-ui-charts";

import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";

function filterOutStylingMetric(bucketItems: IAttributeOrMeasure[], insight: IInsightDefinition) {
    const stylingMetricsIds: string[] = insight.insight.properties?.["controls"]?.["thresholdMeasures"] ?? [];
    return bucketItems.filter((item) => {
        return isMeasure(item) && !stylingMetricsIds.includes(item.measure.localIdentifier);
    });
}

export function countBucketItems(insight: IInsightDefinition | undefined): {
    viewByItemCount: number;
    measureItemCount: number;
    secondaryMeasureItemCount: number;
} {
    if (!insight) {
        return {
            viewByItemCount: 0,
            measureItemCount: 0,
            secondaryMeasureItemCount: 0,
        };
    }

    const viewBucket = insightBucket(insight, BucketNames.VIEW);
    const measureBucket = insightBucket(insight, BucketNames.MEASURES);
    const secondaryMeasureBucket = insightBucket(insight, BucketNames.SECONDARY_MEASURES);

    return {
        viewByItemCount: viewBucket ? bucketItems(viewBucket).length : 0,
        measureItemCount: measureBucket
            ? filterOutStylingMetric(bucketItems(measureBucket), insight).length
            : 0,
        secondaryMeasureItemCount: secondaryMeasureBucket
            ? filterOutStylingMetric(bucketItems(secondaryMeasureBucket), insight).length
            : 0,
    };
}

export function countItemsOnAxes(
    type: string | undefined,
    controls: IVisualizationProperties | undefined,
    insight: IInsightDefinition | undefined,
): {
    xaxis: number;
    yaxis: number;
    secondary_xaxis?: number;
    secondary_yaxis?: number;
} {
    const isBarFamilyChartType = isBarChart(type) || isBulletChart(type);

    const { viewByItemCount, measureItemCount, secondaryMeasureItemCount } = countBucketItems(insight);
    const totalMeasureItemCount = measureItemCount + secondaryMeasureItemCount;

    const secondaryMeasureCountInConfig = (
        isBarFamilyChartType
            ? (controls?.["secondary_xaxis"]?.measures ?? [])
            : (controls?.["secondary_yaxis"]?.measures ?? [])
    ).length;

    if (isBarFamilyChartType) {
        return {
            yaxis: viewByItemCount,
            xaxis: totalMeasureItemCount - secondaryMeasureCountInConfig,
            secondary_xaxis: secondaryMeasureCountInConfig,
        };
    }

    if (isScatterPlot(type) || isBubbleChart(type)) {
        return {
            xaxis: measureItemCount,
            yaxis: secondaryMeasureItemCount,
        };
    }

    return {
        xaxis: viewByItemCount,
        yaxis: totalMeasureItemCount - secondaryMeasureCountInConfig,
        secondary_yaxis: secondaryMeasureCountInConfig,
    };
}
