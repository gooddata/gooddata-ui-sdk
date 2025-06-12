// (C) 2023 GoodData Corporation

import { IChartConfig } from "../../../interfaces/index.js";
import { HighchartsOptions, XAxisOptions } from "../../lib/index.js";
import { IChartOptions } from "../../typings/unsafe.js";
import { isWaterfall } from "../_util/common.js";

function shortenXAxisLabel(xAxis: XAxisOptions[]) {
    if (!xAxis?.[0]?.categories || !xAxis[0].categories.some((item) => item.length >= 50)) {
        return {};
    }
    return {
        xAxis: [
            {
                labels: {
                    useHTML: true,
                    style: {
                        width: 200,
                        textOverflow: "ellipsis",
                    },
                },
            },
        ],
    };
}

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
        ...shortenXAxisLabel(config.xAxis as XAxisOptions[]),
    };
}
