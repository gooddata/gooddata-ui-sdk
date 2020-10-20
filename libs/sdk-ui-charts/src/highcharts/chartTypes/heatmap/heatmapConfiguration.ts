// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import last from "lodash/last";
import Highcharts from "../../adapter/highcharts";
import {
    IHighchartsAxisExtend,
    IHighchartsSeriesExtend,
    IHighchartsSeriesOptionsType,
} from "../../typings/extend";

function between(x: number, lowerLimit: number, higherLimit: number): number {
    return Math.min(Math.max(lowerLimit, x), higherLimit);
}

// Fix Highchart issue https://github.com/highcharts/highcharts/issues/11229
export function resetPointPaddingForTooSmallHeatmapCells(series: IHighchartsSeriesExtend): void {
    const xAxis: IHighchartsAxisExtend = series.xAxis;
    const yAxis: IHighchartsAxisExtend = series.yAxis;
    const options: IHighchartsSeriesOptionsType = series.options;
    const seriesPointPadding: number = options.pointPadding || 0;
    const pointPlacement: number = series.pointPlacementToXValue();

    series.points.forEach((point: Highcharts.Point) => {
        // Recalculate (x1, x2, y1, y2) <=> (left, right, top, bottom) of heatmap cells in pixels
        // Transform the calculation of x1, x2, y1, y2 from javascripts to typescripts
        // From source: https://github.com/highcharts/highcharts/blob/v7.1.1/js/parts-map/HeatmapSeries.js#L222
        const xPad: number = (options.colsize || 1) / 2;
        const yPad: number = (options.rowsize || 1) / 2;
        const x1 = between(
            Math.round(xAxis.len - xAxis.translate(point.x - xPad, 0, 1, 0, 1, -pointPlacement)),
            -xAxis.len,
            2 * xAxis.len,
        );
        const x2 = between(
            Math.round(xAxis.len - xAxis.translate(point.x + xPad, 0, 1, 0, 1, -pointPlacement)),
            -xAxis.len,
            2 * xAxis.len,
        );
        const y1 = between(
            Math.round(yAxis.translate(point.y - yPad, 0, 1, 0, 1)),
            -yAxis.len,
            2 * yAxis.len,
        );
        const y2 = between(
            Math.round(yAxis.translate(point.y + yPad, 0, 1, 0, 1)),
            -yAxis.len,
            2 * yAxis.len,
        );
        const pointPadding: number = point.pointPadding || seriesPointPadding;

        // width: Math.abs(x2 - x1) - pointPadding * 2
        // height: Math.abs(y2 - y1) - pointPadding * 2
        // Note for highchart upgrading later:
        //   1. The modification reset only pointPadding property by below `if`.
        //   2. Another parts just transform javascript to typescripts.
        if (Math.abs(x2 - x1) < pointPadding * 2 || Math.abs(y2 - y1) < pointPadding * 2) {
            // reset pointPadding if new width/Height is negative number
            point.pointPadding = 0;
        }
    });
}
const HEATMAP_TEMPLATE = {
    chart: {
        type: "heatmap",
        marginTop: 8,
        marginRight: 0,
        spacingRight: 0,
    },
    plotOptions: {
        heatmap: {
            dataLabels: {
                enabled: true,
                allowOverlap: false,
                crop: true,
                overflow: "justify",
            },
            point: {
                events: {
                    // from Highcharts 5.0.0 cursor can be set by using 'className' for individual data items
                    mouseOver() {
                        if (this.drilldown) {
                            this.graphic.element.style.cursor = "pointer";
                        }
                    },
                },
            },
            events: {
                afterGeneratePoints() {
                    resetPointPaddingForTooSmallHeatmapCells(this);
                },
            },
        },
    },
    yAxis: [
        {
            labels: {
                formatter() {
                    const { axis, isLast } = this;
                    const { tickPositions, categories } = axis;
                    // tickPositions is array of index of categories
                    const lastIndex = parseInt(last(tickPositions).toString(), 10);
                    const lastCategory = categories ? categories[lastIndex] : null;
                    let labelValue = axis.defaultLabelFormatter.call(this);

                    // When generate linear tick positions base on categories length.
                    // Last tick position can be out of index of categories.
                    // In this case, set label value to null to ignore last label.
                    if (isLast && categories && !lastCategory) {
                        labelValue = null;
                    }
                    return labelValue;
                },
            },
        },
    ],
};

export function getHeatmapConfiguration(): typeof HEATMAP_TEMPLATE {
    return cloneDeep(HEATMAP_TEMPLATE);
}
