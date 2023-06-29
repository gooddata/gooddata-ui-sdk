// (C) 2019-2020 GoodData Corporation
import { IAxisConfig } from "../../../interfaces/index.js";
import { isBarChart } from "../_util/common.js";
import {
    ALIGN_LEFT,
    ALIGN_RIGHT,
    BOTTOM_AXIS_MARGIN,
    ROTATE_60_DEGREES,
    ROTATE_90_DEGREES,
    ROTATE_NEGATIVE_60_DEGREES,
    ROTATE_NEGATIVE_90_DEGREES,
} from "../../constants/axisLabel.js";
import { IChartOptions } from "../../typings/unsafe.js";
import { XAxisOptions } from "highcharts";

function getLabelOptions(index: number, aligns: Highcharts.AlignValue[]): Highcharts.XAxisOptions {
    const isOppositeAxis: boolean = index === 1;
    const align: Highcharts.AlignValue = aligns[index];
    const y: number = isOppositeAxis ? undefined : BOTTOM_AXIS_MARGIN;
    return {
        labels: {
            align,
            y,
        },
    };
}

export function getAxisLabelConfigurationForDualBarChart(chartOptions: IChartOptions): {
    yAxis?: XAxisOptions[];
} {
    const { type, yAxes = [] } = chartOptions;
    const isBar: boolean = isBarChart(type);
    const isDualAxis: boolean = yAxes.length === 2;
    const isDualAxisBarChart: boolean = isBar && isDualAxis;

    if (!isDualAxisBarChart) {
        return {};
    }

    const { yAxisProps, secondary_yAxisProps } = chartOptions;
    const yAxesConfig: Highcharts.XAxisOptions[] = [yAxisProps, secondary_yAxisProps].map(
        (axis: IAxisConfig = {}, index: number): Highcharts.XAxisOptions => {
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
