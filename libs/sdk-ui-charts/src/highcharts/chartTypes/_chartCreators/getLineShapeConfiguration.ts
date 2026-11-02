// (C) 2026 GoodData Corporation

import { type ChartType } from "@gooddata/sdk-ui";

import { type HighchartsOptions } from "../../lib/index.js";
import {
    type AnySeriesOptions,
    isAreaChart,
    isComboChart,
    isLineChart,
    isSeriesOptionsType,
} from "../_util/common.js";

import { type IConfiguratorContext } from "./configuratorContext.js";

export function getLineShapeConfiguration({
    chartOptions: { type },
    chartConfig: { lineShape },
    highchartsOptions: { series },
}: IConfiguratorContext): HighchartsOptions {
    function isSupportedChartType(type?: ChartType) {
        return isLineChart(type) || isAreaChart(type) || isComboChart(type);
    }

    function mapSeries(seriesItem: AnySeriesOptions): AnySeriesOptions {
        if (!isSeriesOptionsType(seriesItem)) {
            return seriesItem;
        }
        return seriesItem.type === "line"
            ? { ...seriesItem, type: "spline" }
            : seriesItem.type === "area"
              ? { ...seriesItem, type: "areaspline" }
              : seriesItem;
    }

    function mapForecastSeries(seriesItem: AnySeriesOptions): AnySeriesOptions {
        return isSeriesOptionsType(seriesItem) && seriesItem.type === "arearange"
            ? { ...seriesItem, type: "areasplinerange" }
            : seriesItem;
    }

    return {
        ...(isLineChart(type) && lineShape === "spline"
            ? {
                  chart: { type: "spline" },
                  ...(series ? { series: series.map(mapForecastSeries) } : {}),
              }
            : {}),
        ...(isAreaChart(type) && lineShape === "spline" ? { chart: { type: "areaspline" } } : {}),
        ...(isSupportedChartType(type) && lineShape === "stepped"
            ? { plotOptions: { series: { step: "left" } } }
            : {}),
        ...(isComboChart(type) && lineShape === "spline" && series ? { series: series.map(mapSeries) } : {}),
    };
}
