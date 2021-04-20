// (C) 2007-2021 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";

import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive";
import { IChartConfig } from "../../../interfaces";
import { HighchartsOptions } from "../../../highcharts/lib";

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
            stackLabels: {
                enabled: false,
            },
        },
    ],
};

export function getBulletConfiguration(config: IChartConfig): HighchartsOptions {
    const bulletConfiguration = cloneDeep(BULLET_TEMPLATE);

    if (config?.enableCompactSize) {
        const reversed = true;
        return {
            ...bulletConfiguration,
            responsive: getCommonResponsiveConfig(reversed),
        };
    }

    return bulletConfiguration;
}
