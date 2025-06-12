// (C) 2019-2023 GoodData Corporation
import { XAxisTitleOptions, YAxisTitleOptions } from "highcharts";
import { VisualizationTypes } from "@gooddata/sdk-ui";

import { IAxisNameConfig } from "../../../interfaces/index.js";
import { IAxis, IChartOptions } from "../../typings/unsafe.js";
import { isOneOfTypes } from "../_util/common.js";
import { ROTATE_NEGATIVE_90_DEGREES, ALIGN_LEFT, ALIGN_RIGHT } from "../../constants/axisLabel.js";

type HighchartsAxisTitle = XAxisTitleOptions | YAxisTitleOptions;

const axisNameConfigGetter = (chartOptions: IChartOptions) => (axisNamePrefix: string) =>
    ((chartOptions as Record<string, IAxis[]>)?.[`${axisNamePrefix}Axes`] ?? []).map((axis: IAxis) => {
        if (!axis) {
            return {};
        }

        return {
            title: getHighchartsAxisTitleConfiguration(chartOptions, axis, axisNamePrefix),
        };
    });

type AxisNameConfigType = "xAxisProps" | "yAxisProps" | "secondary_xAxisProps" | "secondary_yAxisProps";

function getHighchartsAxisTitleConfiguration(
    chartOptions: IChartOptions,
    axis: IAxis,
    axisNamePrefix: string,
): HighchartsAxisTitle {
    const isYAxis = axisNamePrefix === "y";
    const opposite = axis?.opposite ?? false;
    const axisPropsKey = (
        opposite ? `secondary_${axisNamePrefix}AxisProps` : `${axisNamePrefix}AxisProps`
    ) as AxisNameConfigType;
    const axisNameConfig: IAxisNameConfig = chartOptions?.[axisPropsKey]?.name ?? {};
    const title: HighchartsAxisTitle = {};

    if (axisNameConfig.position) {
        title.align = axisNameConfig.position; // low | middle | high
    }

    // config.visible should be true/undefined by default
    if (axisNameConfig.visible === false) {
        title.text = "";
    }

    // opposite Y axis in combo, column and line chart
    // should be rotated the same way as its counterpart
    // and text alignment reversed from default
    if (
        opposite &&
        isYAxis &&
        isOneOfTypes(chartOptions.type, [
            VisualizationTypes.COMBO,
            VisualizationTypes.COMBO2,
            VisualizationTypes.COLUMN,
            VisualizationTypes.LINE,
        ])
    ) {
        title.rotation = Number(ROTATE_NEGATIVE_90_DEGREES);
        if (title.align === "low") {
            title.textAlign = ALIGN_LEFT;
        } else if (title.align === "high") {
            title.textAlign = ALIGN_RIGHT;
        }
    }

    return title;
}

export function getAxisNameConfiguration(chartOptions: IChartOptions): { xAxis: any; yAxis: any } {
    const configGetter = axisNameConfigGetter(chartOptions);
    return {
        xAxis: configGetter("x"),
        yAxis: configGetter("y"),
    };
}
