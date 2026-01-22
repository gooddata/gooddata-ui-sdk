// (C) 2023-2026 GoodData Corporation

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { type IChartOptions } from "../../typings/unsafe.js";
import { isWaterfall } from "../_util/common.js";

export function getWaterfallXAxisConfiguration(
    chartOptions: IChartOptions,
    _config: HighchartsOptions,
    chartConfig?: IChartConfig,
) {
    const { data, type } = chartOptions;

    if (!isWaterfall(type)) {
        return {};
    }

    const hasTotalMeasure = (chartConfig?.total?.measures?.length ?? 0) > 0;

    return {
        xAxis: [
            {
                categories: hasTotalMeasure ? undefined : data?.categories,
                type: "category",
            },
        ],
    };
}
