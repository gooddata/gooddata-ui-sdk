// (C) 2019-2020 GoodData Corporation
import get = require("lodash/get");
import { XAxisTitleOptions, YAxisTitleOptions } from "highcharts";
import { IChartOptions, IAxis } from "../../Config";
import { IAxisNameConfig } from "../../../interfaces";

type HighchartsAxisTitle = XAxisTitleOptions | YAxisTitleOptions;

const axisNameConfigGetter = (chartOptions: IChartOptions) => (axisNamePrefix: string) =>
    get(chartOptions, `${axisNamePrefix}Axes`, []).map((axis: IAxis) => {
        if (!axis) {
            return {};
        }

        const opposite = get(axis, "opposite", false);
        const axisPropsKey = opposite ? `secondary_${axisNamePrefix}AxisProps` : `${axisNamePrefix}AxisProps`;

        return {
            title: getHighchartsAxisTitleConfiguration(chartOptions, axisPropsKey),
        };
    });

function getHighchartsAxisTitleConfiguration(
    chartOptions: IChartOptions,
    axisPropsKey: string,
): HighchartsAxisTitle {
    const axisNameConfig: IAxisNameConfig = get(chartOptions, axisPropsKey.concat(".name"), {});
    const title: HighchartsAxisTitle = {};

    if (axisNameConfig.position) {
        title.align = axisNameConfig.position; // low | middle | high
    }

    // config.visible should be true/undefined by default
    if (axisNameConfig.visible === false) {
        title.text = "";
    }

    return title;
}

export function getAxisNameConfiguration(chartOptions: IChartOptions) {
    const configGetter = axisNameConfigGetter(chartOptions);
    return {
        xAxis: configGetter("x"),
        yAxis: configGetter("y"),
    };
}
