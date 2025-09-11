// (C) 2025 GoodData Corporation

import { IMeasureGroupDescriptor } from "@gooddata/sdk-model";

import { IChartConfig, IDistinctPointShapes, PointShapeSymbolType } from "../../../interfaces/index.js";
import { ISeriesItem } from "../../typings/unsafe.js";
import { isAreaChart, isComboChart, isLineChart } from "../_util/common.js";

/**
 * Configuration for distinct point shapes with enhanced visibility using built-in Highcharts symbols
 */
const POINT_SHAPES_CONFIGS: { symbol: PointShapeSymbolType }[] = [
    { symbol: "circle" },
    { symbol: "square" },
    { symbol: "triangle" },
    { symbol: "triangle-down" },
    { symbol: "diamond" },
];

/**
 * Checks if the chart type supports distinct point shapes
 */
function supportsDistinctPointShapes(chartType: string): boolean {
    return isLineChart(chartType) || isAreaChart(chartType) || isComboChart(chartType);
}

/**
 * Applies distinct point shapes to series data for charts that support it
 */
function setupDistinctPointShapes(
    series: ISeriesItem[],
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    distinctPointShapes?: IDistinctPointShapes,
) {
    if (!series || !Array.isArray(series)) {
        return series;
    }

    return series.map((seriesItem: ISeriesItem, index: number) => {
        // Only apply to line-based series (line, area, or combo with line parts)
        if (!seriesItem.type || seriesItem.type === "line") {
            let symbol: string | undefined;

            // 1. Try to get a mapping by measure local identifier
            if (distinctPointShapes?.pointShapeMapping && measureGroup.items[index]) {
                const localIdentifier = measureGroup.items[index].measureHeaderItem.localIdentifier;
                symbol = distinctPointShapes.pointShapeMapping[localIdentifier];
            }

            // 2. Fallback: cycle through default configs
            if (!symbol) {
                const configIndex = index % POINT_SHAPES_CONFIGS.length;
                symbol = POINT_SHAPES_CONFIGS[configIndex].symbol;
            }

            return {
                ...seriesItem,
                marker: {
                    ...seriesItem.marker,
                    symbol,
                },
                pointShape: symbol,
            };
        }

        return seriesItem;
    });
}

/**
 * Applies distinct point shapes to series when enabled
 */
export function setupDistinctPointShapesToSeries(
    type: string,
    series: ISeriesItem[],
    chartConfig: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
) {
    const distinctPointShapes = chartConfig?.distinctPointShapes;
    const isDistinctPointShapesEnabled = chartConfig?.distinctPointShapes?.enabled ?? false;
    const areDataPointsHidden = chartConfig?.dataPoints?.visible === false;

    // Return unchanged series if distinct point shapes should not be applied
    if (!isDistinctPointShapesEnabled || areDataPointsHidden || !supportsDistinctPointShapes(type)) {
        return series;
    }

    return setupDistinctPointShapes(series, measureGroup, distinctPointShapes);
}
