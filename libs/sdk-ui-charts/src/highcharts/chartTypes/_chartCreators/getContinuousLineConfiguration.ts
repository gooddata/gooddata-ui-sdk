// (C) 2023-2026 GoodData Corporation

import { type HighchartsOptions, type SeriesAreaOptions } from "../../lib/index.js";
import { isAreaChart, isComboChart } from "../_util/common.js";

import { type IConfiguratorContext } from "./configuratorContext.js";

const removeStacking = (series: SeriesAreaOptions[]) =>
    series.map((seriesItem: SeriesAreaOptions) =>
        seriesItem.type && !isAreaChart(seriesItem.type)
            ? seriesItem
            : {
                  ...seriesItem,
                  stack: null,
                  stacking: null,
              },
    );

export function getContinuousLineConfiguration({
    chartOptions,
    highchartsOptions: config,
    chartConfig,
}: IConfiguratorContext): HighchartsOptions {
    const isContinuousLineEnabled = chartConfig?.continuousLine?.enabled ?? false;
    if (!isContinuousLineEnabled || chartConfig?.stackMeasures) {
        return {};
    }
    const { type } = chartOptions;
    const series = config?.series as SeriesAreaOptions[];
    // remove the stack configuration for the Combo|Area chart
    const sanitizedSeries = isComboChart(type) || isAreaChart(type) ? removeStacking(series) : series;

    return {
        plotOptions: {
            series: {
                connectNulls: isContinuousLineEnabled,
            },
        },
        // @ts-expect-error `removeStacking()` sets `{ stack: null, stacking: null }`, but Highcharts accepts
        // only `undefined` for these properties. We can't set `undefined` there though, because lodash'es `merge()`
        // function (in `getCustomizedConfiguration()`) then doesn't update the value to `undefined` (i.e. clears the value),
        // but ignores it and keeps previous value, which is exactly what we don't want here.
        series: sanitizedSeries,
    };
}
