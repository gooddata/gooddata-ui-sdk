// (C) 2026 GoodData Corporation

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";
import { getAxesCounts } from "../_util/common.js";

export function getMekkoConfiguration(config: IChartConfig): HighchartsOptions {
    const mekkoConfiguration: HighchartsOptions = {
        // Mekko (Marimekko) is rendered as a stacked `variwide` series: column height comes
        // from the height measure, column width from the per-column width value (point.z).
        chart: {
            type: "variwide",
            spacingTop: 20,
        },
        plotOptions: {
            variwide: {
                dataLabels: {
                    enabled: true,
                    padding: 2,
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
        xAxis: [
            {
                type: "category",
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
            ...mekkoConfiguration,
            responsive: getCommonResponsiveConfig(false, xAxesCount, yAxesCount),
        };
    }

    return mekkoConfiguration;
}
