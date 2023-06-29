// (C) 2023 GoodData Corporation

import { IChartConfig } from "../../../interfaces/index.js";
import { HighchartsOptions } from "../../lib/index.js";
import { IChartOptions } from "../../typings/unsafe.js";
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

    const hasTotalMeasure = chartConfig?.total?.measures?.length > 0;

    return {
        xAxis: [
            {
                categories: hasTotalMeasure ? undefined : data?.categories,
                type: "category",
            },
        ],
    };
}
