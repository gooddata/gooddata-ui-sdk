// (C) 2025 GoodData Corporation

import { IChartConfig } from "../../../interfaces/index.js";
import { HighchartsOptions, SeriesAreaOptions, SeriesLineOptions } from "../../lib/index.js";
import { IChartOptions } from "../../typings/unsafe.js";
import { isAreaChart, isComboChart, isLineChart } from "../_util/common.js";

/**
 * Configuration for distinct point shapes with enhanced visibility using built-in Highcharts symbols
 */
const POINT_SHAPES_CONFIGS = [
    { symbol: "circle" },
    { symbol: "square" },
    { symbol: "triangle" },
    { symbol: "triangle-down" },
    { symbol: "diamond" },
] as const;

/**
 * Checks if the chart type supports distinct point shapes
 */
function supportsDistinctPointShapes(chartType: string, config?: IChartConfig): boolean {
    return (
        isLineChart(chartType) ||
        isAreaChart(chartType) ||
        (isComboChart(chartType) &&
            (config?.secondaryChartType === "line" || config?.primaryChartType === "line"))
    );
}

/**
 * Applies distinct point shapes to series data for charts that support it
 */
function applyDistinctPointShapes(series: SeriesAreaOptions[] | SeriesLineOptions[]) {
    if (!series || !Array.isArray(series)) {
        return series;
    }

    return series.map((seriesItem: SeriesAreaOptions | SeriesLineOptions, index: number) => {
        // Only apply to line-based series (line, area, or combo with line parts)
        if (!seriesItem.type || seriesItem.type === "line" || seriesItem.type === "area") {
            const configIndex = index % POINT_SHAPES_CONFIGS.length;
            const pointShapeConfig = POINT_SHAPES_CONFIGS[configIndex];

            return {
                ...seriesItem,
                marker: {
                    ...seriesItem.marker,
                    symbol: pointShapeConfig.symbol,
                },
                // Add point shape for legend propagation
                pointShape: pointShapeConfig.symbol,
            };
        }

        return seriesItem;
    });
}

/**
 * Configuration function that applies distinct point shapes when enabled
 */
export function getDistinctPointShapesConfiguration(
    chartOptions: IChartOptions,
    config: HighchartsOptions,
    chartConfig?: IChartConfig,
): HighchartsOptions {
    const isDistinctPointShapesEnabled = chartConfig?.distinctPointShapes?.enabled ?? false;
    const areDataPointsHidden = chartConfig?.dataPoints?.visible === false;

    // Disable distinct point shapes when data points are explicitly hidden or chart type is not supported
    if (
        !isDistinctPointShapesEnabled ||
        areDataPointsHidden ||
        !supportsDistinctPointShapes(chartOptions.type, chartConfig)
    ) {
        return {};
    }

    const series = config?.series as SeriesAreaOptions[] | SeriesLineOptions[];
    const updatedSeries = applyDistinctPointShapes(series);

    return {
        series: updatedSeries,
    };
}
