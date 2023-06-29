// (C) 2020-2023 GoodData Corporation
/* *
 * (c) 2010-2019 Torstein Honsi
 *
 * Source: https://github.com/highcharts/highcharts/blob/v7.1.1/js/parts-more/BubbleSeries.js
 * License: www.highcharts.com/license
 *
 * Modified by Lan Huynh to to support
 *  - Set default size for bubbles in bubble chart where size value is not provided
 *  - Fix bubbles is not rendered with min/max config
 */
import isNil from "lodash/isNil.js";
import Highcharts from "../../lib/index.js";
import { IHighchartsAxisExtend } from "../../typings/extend.js";
import { SeriesMapbubbleOptions } from "highcharts";
export interface IBubbleAxis extends IHighchartsAxisExtend {
    allowZoomOutside?: boolean;
    dataMin?: number;
    dataMax?: number;
    options?: any;
    userMin?: number;
    userMax?: number;
}

export interface IBubbleSeries extends Highcharts.Series {
    bubblePadding?: boolean;
    minPxSize?: number;
    maxPxSize?: number;
    zData?: Array<number | null>;
    radii?: Array<number | null>;
    getRadii(zMin: number, zMax: number, series: Highcharts.Series): number | null;
    options: SeriesMapbubbleOptions;
    xData?: Array<number | null>;
    yData?: Array<number | null>;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function renderBubbles(HighchartsInstance: any): void {
    const wrap = HighchartsInstance.wrap;
    const pInt = HighchartsInstance.pInt;
    const arrayMax = HighchartsInstance.arrayMax;
    const arrayMin = HighchartsInstance.arrayMin;
    const pick = HighchartsInstance.pick;
    const isNumber = HighchartsInstance.isNumber;

    if (HighchartsInstance.seriesTypes.bubble) {
        // Set default size for bubbles in bubble chart where size value is not provided
        wrap(
            HighchartsInstance.seriesTypes.bubble.prototype,
            "getRadius",
            function (
                proceed: any,
                zMin: number,
                zMax: number,
                minSize: number,
                maxSize: number,
                value: number,
            ) {
                let radius = proceed.apply(this, [zMin, zMax, minSize, maxSize, value]);
                if (isNaN(value) && isNil(radius)) {
                    // Relative size, a number between 0 and 1 (default is 0.5)
                    // Use Math.sqrt for bubble is sized by area
                    radius = Math.ceil(minSize + Math.sqrt(0.5) * (maxSize - minSize)) / 2;
                }
                return radius;
            },
        );

        // #SD-479 fix bubbles is not rendered with min/max config
        wrap(HighchartsInstance.Axis.prototype, "beforePadding", function (_proceed: any) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const axis: IBubbleAxis = this;
            const axisLength: number = this.len;
            const chart: Highcharts.Chart = this.chart;
            const isXAxis: boolean = this.isXAxis;
            const min: number = this.min;
            const range = this.max - min;
            const activeSeries: IBubbleSeries[] = [];

            let pxMin: number = 0;
            let pxMax: number = axisLength;
            let transA = axisLength / range;
            let zMin = Number.MAX_VALUE;
            let zMax = -Number.MAX_VALUE;

            function translateSizeToPixel(size: string | number): number {
                const smallestSize = Math.min(chart.plotWidth, chart.plotHeight);
                const isPercent = typeof size === "string" ? /%$/.test(size) : false;
                const pxSize = pInt(size);
                return isPercent ? (smallestSize * pxSize) / 100 : pxSize;
            }

            // Handle padding on the second pass, or on redraw
            this.series.forEach((series: IBubbleSeries) => {
                const seriesOptions = series.options;

                if (series.bubblePadding && (series.visible || !chart.options.chart.ignoreHiddenSeries)) {
                    // Correction for #1673
                    axis.allowZoomOutside = true;

                    // Cache it
                    activeSeries.push(series);

                    if (isXAxis) {
                        // because X axis is evaluated first

                        // For each series, translate the size extremes to pixel values
                        const minSize = translateSizeToPixel(seriesOptions.minSize);
                        const maxSize = translateSizeToPixel(seriesOptions.maxSize);
                        series.minPxSize = minSize;
                        // Prioritize min size if conflict to make sure bubbles are
                        // always visible. #5873
                        series.maxPxSize = Math.max(maxSize, minSize);

                        // Find the min and max Z
                        const zData = series.zData.filter(isNumber);
                        if (zData.length) {
                            // #1735
                            zMin = pick(
                                seriesOptions.zMin,
                                Math.min(
                                    zMin,
                                    Math.max(
                                        arrayMin(zData),
                                        seriesOptions.displayNegative === false
                                            ? seriesOptions.zThreshold
                                            : -Number.MAX_VALUE,
                                    ),
                                ),
                            );
                            zMax = pick(seriesOptions.zMax, Math.max(zMax, arrayMax(zData)));
                        }
                    }
                }
            });

            activeSeries.forEach((series) => {
                const dataKey = isXAxis ? "xData" : "yData";
                const data = series[dataKey];
                let i = data.length;

                if (isXAxis) {
                    series.getRadii(zMin, zMax, series);
                }

                if (range > 0) {
                    while (i--) {
                        if (isNumber(data[i]) && axis.dataMin <= data[i] && data[i] <= axis.dataMax) {
                            const radius = series.radii[i];
                            pxMin = Math.min((data[i] - min) * transA - radius, pxMin);
                            pxMax = Math.max((data[i] - min) * transA + radius, pxMax);
                        }
                    }
                }
            });

            // Apply the padding to the min and max properties
            if (activeSeries.length && range > 0 && !this.isLog) {
                pxMax -= axisLength;
                // Note for Highchart upgrading later:
                //  - Modified the calculation of transA only
                //  - And transform from javascript to typescripts
                const pxRange = Math.abs(Math.max(0, pxMin) - Math.min(pxMax, axisLength));
                transA *= (axisLength + pxRange) / axisLength;

                if (pick(axis.options.min, axis.userMin) === undefined) {
                    axis.min += pxMin / transA;
                }
                if (pick(axis.options.max, axis.userMax) === undefined) {
                    axis.max += pxMax / transA;
                }
            }
        });
    }
}
