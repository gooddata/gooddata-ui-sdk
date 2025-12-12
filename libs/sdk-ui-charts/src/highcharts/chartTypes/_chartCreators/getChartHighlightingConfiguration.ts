// (C) 2023-2025 GoodData Corporation

import { type IChartConfig } from "../../../interfaces/index.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { type IChartOptions } from "../../typings/unsafe.js";
import {
    getSeriesHighlightingClassNameObj,
    highlightChartPoints,
} from "../_chartHighlighting/highlightPoints.js";

export function getChartHighlightingConfiguration(
    chartOptions: IChartOptions,
    config: HighchartsOptions,
    chartConfig?: IChartConfig,
): HighchartsOptions {
    // Here we overwrite the load event of the chart to highlight the points.
    // Some charts already have this event, so we avoid overwriting it
    // and rather extend the original events in particular chart's config.
    const eventsObj =
        chartOptions.type === "pie" || chartOptions.type === "donut"
            ? {}
            : {
                  load(this: Highcharts.Chart) {
                      highlightChartPoints(this.series, chartConfig);
                  },
              };

    return {
        ...config,
        chart: {
            ...config?.chart,
            events: {
                ...config?.chart?.events,
                ...eventsObj,
            },
        },
        plotOptions: {
            ...config?.plotOptions,
            series: {
                ...config?.plotOptions?.series,
                ...getSeriesHighlightingClassNameObj(chartConfig),
            },
        },
    };
}
