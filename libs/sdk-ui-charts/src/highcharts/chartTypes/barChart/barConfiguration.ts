// (C) 2007-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { HighchartsOptions } from "../../../highcharts/lib";
import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration";
import { IChartConfig } from "../../../interfaces";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive";
import { getAxesCounts } from "../_util/common";

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

    if (config?.enableCompactSize && !config?.zoomInsight) {
        const reversed = true;
        const [xAxesCount, yAxesCount] = getAxesCounts(config);
        return {
            ...barConfiguration,
            responsive: getCommonResponsiveConfig(reversed, xAxesCount, yAxesCount),
        };
    }

    return barConfiguration;
}
