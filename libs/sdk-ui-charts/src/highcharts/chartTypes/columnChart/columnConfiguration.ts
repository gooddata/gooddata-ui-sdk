// (C) 2007-2026 GoodData Corporation

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";
import { getAxesCounts } from "../_util/common.js";

export function getColumnConfiguration(config: IChartConfig): HighchartsOptions {
    const columnConfiguration = {
        chart: {
            type: "column",
            spacingTop: 20,
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    padding: 2,
                },
                maxPointWidth: MAX_POINT_WIDTH,
            },
            series: {
                states: {
                    hover: {
                        enabled: false,
                    },
                },
            },
        },
        xAxis: [
            {
                labels: {
                    distance: 7,
                },
            },
        ],
        yAxis: [
            {
                stackLabels: {
                    enabled: true,
                    allowOverlap: false,
                },
            },
        ],
    };

    if (config?.enableCompactSize && !config?.zoomInsight) {
        const [xAxesCount, yAxesCount] = getAxesCounts(config);
        return {
            ...columnConfiguration,
            responsive: getCommonResponsiveConfig(false, xAxesCount, yAxesCount),
        };
    }

    return columnConfiguration;
}
