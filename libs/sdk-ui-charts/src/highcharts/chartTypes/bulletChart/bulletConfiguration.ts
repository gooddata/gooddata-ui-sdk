// (C) 2007-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";

const BULLET_TEMPLATE = {
    chart: {
        type: "bar",
    },
    plotOptions: {
        bar: {
            maxPointWidth: MAX_POINT_WIDTH,
            dataLabels: {
                enabled: false,
            },
        },
        bullet: {
            maxPointWidth: MAX_POINT_WIDTH,
            tooltip: {
                followPointer: true,
            },
            targetOptions: {
                borderWidth: 0,
            },
        },
        series: {
            states: {
                hover: {
                    enabled: false,
                },
            },
            grouping: false,
            borderWidth: 0,
        },
    },
    yAxis: [
        {
            labels: {
                distance: 7,
            },
            stackLabels: {
                enabled: false,
            },
        },
    ],
};

export function getBulletConfiguration(config: IChartConfig): HighchartsOptions {
    const bulletConfiguration = cloneDeep(BULLET_TEMPLATE);

    if (config?.enableCompactSize && !config?.zoomInsight) {
        const reversed = true;
        return {
            ...bulletConfiguration,
            responsive: getCommonResponsiveConfig(reversed),
        };
    }

    return bulletConfiguration;
}
