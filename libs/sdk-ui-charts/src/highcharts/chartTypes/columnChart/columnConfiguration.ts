// (C) 2007-2022 GoodData Corporation
import { IExecutionDefinition, ITheme } from "@gooddata/sdk-model";
import { IChartConfig } from "../../../interfaces/index.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";
import { HighchartsOptions } from "../../lib/index.js";

import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration.js";
import { getAxesCounts } from "../_util/common.js";

export function getColumnConfiguration(
    config: IChartConfig,
    _definition: IExecutionDefinition,
    theme: ITheme,
): HighchartsOptions {
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
        yAxis: [
            {
                stackLabels: {
                    enabled: true,
                    allowOverlap: false,
                    ...(theme?.palette?.complementary && {
                        style: {
                            color: theme?.palette?.complementary?.c9,
                            textOutline: "none",
                        },
                    }),
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
