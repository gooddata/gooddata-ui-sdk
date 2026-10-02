// (C) 2023-2026 GoodData Corporation

import { type HighchartsOptions, type XAxisOptions } from "../../lib/index.js";
import { isWaterfall } from "../_util/common.js";

import { type IConfiguratorContext } from "./configuratorContext.js";

function shortenXAxisLabel(xAxis: XAxisOptions[]) {
    if (!xAxis?.[0]?.categories?.some((item) => item.length >= 50)) {
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

export function getChartOrientationConfiguration({
    chartOptions,
    highchartsOptions: config,
    chartConfig,
}: IConfiguratorContext): HighchartsOptions {
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
                    // oxlint-disable-next-line @typescript-eslint/no-misused-spread
                    ...config.plotOptions?.waterfall?.dataLabels,
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
