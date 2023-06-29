// (C) 2007-2022 GoodData Corporation
import { IExecutionDefinition, ITheme } from "@gooddata/sdk-model";
import { IChartConfig } from "../../../interfaces/index.js";
import { styleVariables } from "../_chartCreators/styles/variables.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";
import { HighchartsOptions } from "../../lib/index.js";
import { getAxesCounts } from "../_util/common.js";

export const LINE_WIDTH = 3;

export function getLineConfiguration(
    config: IChartConfig,
    _definition: IExecutionDefinition,
    theme: ITheme,
): HighchartsOptions {
    const lineConfiguration = {
        chart: {
            type: "line",
        },
        plotOptions: {
            series: {
                marker: {
                    symbol: "circle",
                    radius: 4.5,
                    lineColor:
                        theme?.chart?.backgroundColor ??
                        theme?.palette?.complementary?.c0 ??
                        styleVariables.gdColorBackground,
                },
                lineWidth: LINE_WIDTH,
                fillOpacity: 0.3,
                states: {
                    hover: {
                        lineWidth: LINE_WIDTH + 1,
                    },
                    inactive: {
                        opacity: 1,
                    },
                },
            },
            column: {
                dataLabels: {
                    enabled: true,
                },
            },
        },
        xAxis: [
            {
                categories: [] as string[],
            },
        ],
        yAxis: [
            {
                stackLabels: {
                    enabled: false,
                },
            },
        ],
    };

    if (config?.enableCompactSize && !config?.zoomInsight) {
        const [xAxesCount, yAxesCount] = getAxesCounts(config);
        return {
            ...lineConfiguration,
            responsive: getCommonResponsiveConfig(false, xAxesCount, yAxesCount),
        };
    }

    return lineConfiguration;
}
