// (C) 2023-2026 GoodData Corporation

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";
import { getAxesCounts } from "../_util/common.js";

export function getWaterfallConfiguration(config: IChartConfig): HighchartsOptions {
    const waterfallConfiguration = {
        chart: {
            type: "waterfall",
        },
        plotOptions: {
            waterfall: {
                maxPointWidth: MAX_POINT_WIDTH,
                dataLabels: {
                    enabled: true,
                    padding: 2,
                    verticalAlign: "top",
                    y: -20,
                },
            },
            series: {
                states: {
                    hover: {
                        enabled: false,
                    },
                },
            },
        },
        legend: {
            enabled: false,
        },
        xAxis: [
            {
                labels: {
                    distance: 7,
                },
            },
        ],
    };

    return config?.enableCompactSize
        ? {
              ...waterfallConfiguration,
              responsive: getCommonResponsiveConfig(false, ...getAxesCounts(config)),
          }
        : waterfallConfiguration;
}
