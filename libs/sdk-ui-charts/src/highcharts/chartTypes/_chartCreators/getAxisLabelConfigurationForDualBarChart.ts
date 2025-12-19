// (C) 2019-2025 GoodData Corporation

import { type IAxisConfig } from "../../../interfaces/index.js";
import {
    ALIGN_LEFT,
    ALIGN_RIGHT,
    BOTTOM_AXIS_MARGIN,
    ROTATE_60_DEGREES,
    ROTATE_90_DEGREES,
    ROTATE_NEGATIVE_60_DEGREES,
    ROTATE_NEGATIVE_90_DEGREES,
} from "../../constants/axisLabel.js";
import { type XAxisOptions } from "../../lib/index.js";
import { type IChartOptions } from "../../typings/unsafe.js";
import { isBarChart } from "../_util/common.js";

function getLabelOptions(index: number, aligns: Highcharts.AlignValue[]): Highcharts.XAxisOptions {
    const isOppositeAxis: boolean = index === 1;
    const align: Highcharts.AlignValue = aligns[index];
    const y: number | undefined = isOppositeAxis ? undefined : BOTTOM_AXIS_MARGIN;
    return {
        labels: {
            align,
            y,
        },
    };
}

export function getAxisLabelConfigurationForDualBarChart(chartOptions: IChartOptions): {
    yAxis?: (XAxisOptions | undefined)[];
} {
    const { type, yAxes = [] } = chartOptions;
    const isBar: boolean = isBarChart(type);
    const isDualAxis: boolean = yAxes.length === 2;
    const isDualAxisBarChart: boolean = isBar && isDualAxis;

    if (!isDualAxisBarChart) {
        return {};
    }

    const { yAxisProps, secondary_yAxisProps } = chartOptions;
    const yAxesConfig = [yAxisProps, secondary_yAxisProps].map(
        (axis: IAxisConfig = {}, index: number): Highcharts.XAxisOptions | undefined => {
            const { rotation } = axis;

            switch (rotation) {
                case ROTATE_60_DEGREES:
                case ROTATE_90_DEGREES:
                    return getLabelOptions(index, [ALIGN_RIGHT, ALIGN_LEFT]);
                case ROTATE_NEGATIVE_60_DEGREES:
                case ROTATE_NEGATIVE_90_DEGREES:
                    return getLabelOptions(index, [ALIGN_LEFT, ALIGN_RIGHT]);
                default:
                    return undefined;
            }
        },
    );

    return {
        yAxis: yAxesConfig, // yAxis in UI SDK is xaxis in Highcharts for bar chart
    };
}
