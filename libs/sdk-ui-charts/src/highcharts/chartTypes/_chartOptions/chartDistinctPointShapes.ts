// (C) 2025-2026 GoodData Corporation

import { type IMeasureGroupDescriptor } from "@gooddata/sdk-model";

import {
    type IChartConfig,
    type IDistinctPointShapes,
    type PointShapeSymbolType,
} from "../../../interfaces/index.js";
import { type ISeriesItem } from "../../typings/unsafe.js";
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
function supportsDistinctPointShapes(chartType: string | undefined): boolean {
    return isLineChart(chartType) || isAreaChart(chartType) || isComboChart(chartType);
}

/**
 * Applies distinct point shapes to series data for charts that support it
 */
function setupDistinctPointShapes(
    series: ISeriesItem[],
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    distinctPointShapes?: IDistinctPointShapes,
    anomaliesEnabled?: boolean,
) {
    if (!series || !Array.isArray(series)) {
        return series;
    }

    const updatedSeries = series.map((seriesItem: ISeriesItem, index: number) => {
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

    //NOTE: If anomalies are enabled, we need to change the point shape of the anomaly to be the same as
    // the virtual anomaly series
    if (anomaliesEnabled) {
        const anomalySeries = updatedSeries.find((s) => s.anomaly);
        if (anomalySeries) {
            return updatedSeries.map((s) => ({
                ...s,
                data: s.data?.map((d) =>
                    d.anomaly
                        ? {
                              ...d,
                              marker: {
                                  ...d.marker,
                                  symbol: anomalySeries.marker?.symbol,
                              },
                          }
                        : d,
                ),
            }));
        }
    }

    return updatedSeries;
}

/**
 * Applies distinct point shapes to series when enabled
 */
export function setupDistinctPointShapesToSeries(
    type: string | undefined,
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

    return setupDistinctPointShapes(
        series,
        measureGroup,
        distinctPointShapes,
        chartConfig?.anomalies?.enabled,
    );
}
