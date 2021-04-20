// (C) 2007-2021 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { HighchartsOptions } from "../../../highcharts/lib";
import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration";
import { IChartConfig } from "../../../interfaces";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive";

const BAR_TEMPLATE = {
    chart: {
        type: "bar",
    },
    plotOptions: {
        bar: {
            maxPointWidth: MAX_POINT_WIDTH,
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
    yAxis: [
        {
            stackLabels: {
                enabled: false,
            },
        },
    ],
};

export function getBarConfiguration(config: IChartConfig): HighchartsOptions {
    const barConfiguration = cloneDeep(BAR_TEMPLATE);

    if (config?.enableCompactSize) {
        const reversed = true;
        return {
            ...barConfiguration,
            responsive: getCommonResponsiveConfig(reversed),
        };
    }

    return barConfiguration;
}
