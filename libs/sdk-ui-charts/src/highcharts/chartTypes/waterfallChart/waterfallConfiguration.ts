// (C) 2023 GoodData Corporation
import { IChartConfig } from "../../../interfaces/index.js";
import { HighchartsOptions } from "../../lib/index.js";
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
    };

    return !config?.enableCompactSize
        ? waterfallConfiguration
        : {
              ...waterfallConfiguration,
              responsive: getCommonResponsiveConfig(false, ...getAxesCounts(config)),
          };
}
