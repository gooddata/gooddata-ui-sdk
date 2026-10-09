// (C) 2026 GoodData Corporation

import { type ChartType } from "@gooddata/sdk-ui";

import { type HighchartsOptions, type SeriesOptionsType } from "../../lib/index.js";
import { isAreaChart, isComboChart, isLineChart } from "../_util/common.js";

import { type IConfiguratorContext } from "./configuratorContext.js";

export function getLineShapeConfiguration({
    chartOptions: { type },
    chartConfig: { lineShape },
    highchartsOptions: { series },
}: IConfiguratorContext): HighchartsOptions {
    function isSupportedChartType(type?: ChartType) {
        return isLineChart(type) || isAreaChart(type) || isComboChart(type);
    }

    function mapSeries(seriesItem: SeriesOptionsType): SeriesOptionsType {
        return seriesItem.type === "line"
            ? { ...seriesItem, type: "spline" }
            : seriesItem.type === "area"
              ? { ...seriesItem, type: "areaspline" }
              : seriesItem;
    }

    function mapForecastSeries(seriesItem: SeriesOptionsType): SeriesOptionsType {
        return seriesItem.type === "arearange" ? { ...seriesItem, type: "areasplinerange" } : seriesItem;
    }

    return {
        ...(isLineChart(type) && lineShape === "spline"
            ? {
                  chart: { type: "spline" },
                  ...(series ? { series: series.map((seriesItem) => mapForecastSeries(seriesItem)) } : {}),
              }
            : {}),
        ...(isAreaChart(type) && lineShape === "spline" ? { chart: { type: "areaspline" } } : {}),
        ...(isSupportedChartType(type) && lineShape === "stepped"
            ? { plotOptions: { series: { step: "left" } } }
            : {}),
        ...(isComboChart(type) && lineShape === "spline" && series ? { series: series.map(mapSeries) } : {}),
    };
}
