// (C) 2023-2026 GoodData Corporation

import { type HighchartsOptions } from "../../lib/index.js";
import { isWaterfall } from "../_util/common.js";

import { type IConfiguratorContext } from "./configuratorContext.js";

export function getWaterfallXAxisConfiguration({
    chartOptions,
    chartConfig,
}: IConfiguratorContext): HighchartsOptions {
    const { data, type } = chartOptions;

    if (!isWaterfall(type)) {
        return {};
    }

    const hasTotalMeasure = (chartConfig?.total?.measures?.length ?? 0) > 0;

    return {
        xAxis: [
            {
                // @ts-expect-error This is expected as legacy code appends custom properties to Highcharts types. Such properties should ideally moved somewhere else in the future.
                categories: hasTotalMeasure ? undefined : data?.categories,
                type: "category",
            },
        ],
    };
}
