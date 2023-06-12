// (C) 2023 GoodData Corporation

import { IChartConfig } from "../../../interfaces";
import { HighchartsOptions } from "../../lib";
import { IChartOptions } from "../../typings/unsafe";
import { isWaterfall } from "../_util/common";

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
