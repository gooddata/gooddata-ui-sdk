// (C) 2019-2020 GoodData Corporation
import { bucketItems, IInsightDefinition, insightBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { isBarChart, isScatterPlot, isBubbleChart, isBulletChart } from "@gooddata/sdk-ui-charts";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";

export function countBucketItems(insight: IInsightDefinition): {
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
        measureItemCount: measureBucket ? bucketItems(measureBucket).length : 0,
        secondaryMeasureItemCount: secondaryMeasureBucket ? bucketItems(secondaryMeasureBucket).length : 0,
    };
}

export function countItemsOnAxes(
    type: string,
    controls: IVisualizationProperties,
    insight: IInsightDefinition,
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
            ? controls?.secondary_xaxis?.measures ?? []
            : controls?.secondary_yaxis?.measures ?? []
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
