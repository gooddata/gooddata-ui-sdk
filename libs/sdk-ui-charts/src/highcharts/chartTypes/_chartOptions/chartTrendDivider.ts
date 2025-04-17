// (C) 2025 GoodData Corporation

import { VisType } from "@gooddata/sdk-ui";

import { ISeriesItem } from "../../typings/unsafe.js";
import { isLineChart } from "../_util/common.js";
import { IChartConfig } from "../../../interfaces/index.js";

export function injectTrendDivider(
    type: VisType,
    series: ISeriesItem[],
    config: IChartConfig,
): ISeriesItem[] {
    const threshold = config.xaxis?.thresholds?.trendThreshold;

    if (!config.enableLineChartTrendThreshold || !config.xaxis?.thresholds?.enabled) {
        return series;
    }

    if (threshold === undefined || threshold === 0) {
        return series;
    }

    if (!isLineChart(type)) {
        return series;
    }

    if (series.length === 0) {
        return series;
    }

    if (series[0].data.length === 0) {
        return series;
    }

    return series
        .map((seriesItem) => {
            const { data } = seriesItem;
            const cutoffIndex = getCutoffIndex(seriesItem.data.length, threshold);

            if (cutoffIndex === undefined) {
                return [seriesItem];
            }

            const solidData = data.map((value, i) => (i < cutoffIndex ? value : null));
            const dashedData = data.map((value, i) => (i >= cutoffIndex - 1 ? value : null));

            return [
                {
                    ...seriesItem,
                    data: solidData,
                },
                {
                    ...seriesItem,
                    data: dashedData,
                    dashStyle: "dash" as const,
                    showInLegend: false,
                },
            ];
        })
        .flat();
}

function getCutoffIndex(seriesLength: number, threshold: number | undefined): number | undefined {
    if (threshold === undefined || threshold === 0) {
        return undefined;
    }

    const cutoffIndex =
        threshold > 0
            ? threshold + 1 // provided number is not zero based
            : seriesLength + threshold; // counts negative threshold from the back

    return cutoffIndex >= 0 && cutoffIndex < seriesLength ? cutoffIndex : undefined;
}

// for some reason categories array is not typed in some cases
export function getTrendDividerPlotLines(
    type: VisType,
    categories: any[],
    config: IChartConfig,
): number[] | undefined {
    const threshold = config.xaxis?.thresholds?.trendThreshold;

    if (!config.enableLineChartTrendThreshold || !config.xaxis?.thresholds?.enabled) {
        return undefined;
    }

    if (threshold === undefined || threshold === 0) {
        return undefined;
    }
    if (!isLineChart(type)) {
        return undefined;
    }
    return [getCutoffIndex(categories.length, threshold) - 1];
}
