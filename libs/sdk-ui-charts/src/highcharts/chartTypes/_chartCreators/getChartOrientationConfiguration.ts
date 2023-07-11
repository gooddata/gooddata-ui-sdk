// (C) 2023 GoodData Corporation

import { IChartConfig } from "../../../interfaces/index.js";
import { HighchartsOptions } from "../../lib/index.js";
import { IChartOptions } from "../../typings/unsafe.js";
import { isWaterfall } from "../_util/common.js";

export function getChartOrientationConfiguration(
    chartOptions: IChartOptions,
    config: HighchartsOptions,
    chartConfig?: IChartConfig,
): HighchartsOptions {
    const { type } = chartOptions;
    const isInverted = chartConfig?.orientation?.position === "vertical";

    if (!isWaterfall(type) || !isInverted) {
        return {};
    }

    return {
        chart: {
            inverted: isInverted,
        },
        plotOptions: {
            waterfall: {
                dataLabels: {
                    ...config.plotOptions.waterfall.dataLabels,
                    crop: false,
                    overflow: "allow",
                    inside: false,
                    verticalAlign: "middle",
                    y: 0,
                },
            },
        },
    };
}
