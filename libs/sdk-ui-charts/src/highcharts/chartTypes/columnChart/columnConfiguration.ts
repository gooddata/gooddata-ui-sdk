// (C) 2007-2025 GoodData Corporation
import { IChartConfig } from "../../../interfaces/index.js";
import { HighchartsOptions } from "../../lib/index.js";
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
