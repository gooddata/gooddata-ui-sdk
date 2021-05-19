// (C) 2007-2021 GoodData Corporation
import range from "lodash/range";
import cloneDeep from "lodash/cloneDeep";
import { HighchartsResponsiveOptions, XAxisOptions, YAxisOptions } from "../../../highcharts/lib";

const UPPER_LIMIT_RATIO = 35;
const BOTTOM_LIMIT_HEIGHT_RATIO = 15;
const BOTTOM_LIMIT_WIDTH_RATIO = 20;
const PIE_UPPER_LIMIT_WIDTH_PX = 360;
const PIE_BOTTOM_LIMIT_WIDTH_PX = 260;
const PIE_UPPER_LIMIT_HEIGHT_PX = 324;
const PIE_BOTTOM_LIMIT_HEIGHT_PX = 224;
const getRatio = (chartDimension: number, plotDimension: number) => (plotDimension * 100) / chartDimension;
const xAxisLabelsDisabledOption: XAxisOptions = {
    labels: {
        enabled: false,
    },
};
const xAxisTitleDisabledOption: XAxisOptions = {
    title: {
        text: undefined,
    },
};
const yAxisLabelsDisabledOption: YAxisOptions = {
    labels: {
        enabled: false,
    },
};
const yAxisTitleDisabledOption: YAxisOptions = {
    title: {
        text: undefined,
    },
};

function forMultipleAxes<T>(count: number, options: T): Array<T> {
    return range(count).map(() => cloneDeep(options));
}

const getResponsiveConfigOptions = (
    inverted: boolean,
    xAxesCount: number,
    yAxesCount: number,
): HighchartsResponsiveOptions => {
    const axisKeyX = inverted ? "yAxis" : "xAxis";
    const axisKeyY = inverted ? "xAxis" : "yAxis";

    return {
        rules: [
            /**
             * It is here because of the edge case - someone would have to render the chart in a very small container
             */
            {
                condition: {
                    callback: function () {
                        // first rule needs to store original plot size to use it for rules in every other re-evaluation (eg. after zoom)
                        if (this.userOptions?.plotOptions?.series?.custom?.initialPlotWidth === undefined) {
                            this.userOptions.plotOptions.series.custom = {
                                ...this.userOptions?.plotOptions?.series?.custom,
                                initialPlotWidth: this.plotWidth,
                            };
                        }
                        if (this.userOptions?.plotOptions?.series?.custom?.initialPlotHeight === undefined) {
                            this.userOptions.plotOptions.series.custom = {
                                ...this.userOptions?.plotOptions?.series?.custom,
                                initialPlotHeight: this.plotHeight,
                            };
                        }
                        const heightRatio = Math.round(
                            getRatio(
                                this.chartHeight,
                                this.userOptions?.plotOptions?.series?.custom?.initialPlotHeight,
                            ),
                        );
                        const widthRatio = Math.round(
                            getRatio(
                                this.chartWidth,
                                this.userOptions?.plotOptions?.series?.custom?.initialPlotWidth,
                            ),
                        );
                        const isZeroRatio =
                            (heightRatio === 0 && widthRatio < BOTTOM_LIMIT_WIDTH_RATIO) ||
                            (widthRatio === 0 && heightRatio < BOTTOM_LIMIT_HEIGHT_RATIO);
                        if (isZeroRatio) {
                            // eslint-disable-next-line no-console
                            console.warn("container is very small and chart might not be render correctly");
                        }
                        return isZeroRatio;
                    },
                },
                chartOptions: {
                    [axisKeyX]: forMultipleAxes(xAxesCount, xAxisLabelsDisabledOption),
                    [axisKeyY]: forMultipleAxes(yAxesCount, yAxisLabelsDisabledOption),
                },
            },
            {
                condition: {
                    callback: function () {
                        const ratio = Math.round(
                            getRatio(
                                this.chartHeight,
                                this.userOptions?.plotOptions?.series?.custom?.initialPlotHeight,
                            ),
                        );
                        const result = ratio < BOTTOM_LIMIT_HEIGHT_RATIO;
                        return result;
                    },
                },
                chartOptions: {
                    [axisKeyX]: forMultipleAxes(xAxesCount, xAxisLabelsDisabledOption),
                },
            },
            {
                condition: {
                    callback: function () {
                        const ratio = Math.round(
                            getRatio(
                                this.chartHeight,
                                this.userOptions?.plotOptions?.series?.custom?.initialPlotHeight,
                            ),
                        );
                        const result = ratio > BOTTOM_LIMIT_HEIGHT_RATIO && ratio < UPPER_LIMIT_RATIO;
                        return result;
                    },
                },
                chartOptions: {
                    [axisKeyX]: forMultipleAxes(xAxesCount, xAxisTitleDisabledOption),
                },
            },
            {
                condition: {
                    callback: function () {
                        const ratio = Math.round(
                            getRatio(
                                this.chartWidth,
                                this.userOptions?.plotOptions?.series?.custom?.initialPlotWidth,
                            ),
                        );
                        const result = ratio < BOTTOM_LIMIT_WIDTH_RATIO;
                        return result;
                    },
                },
                chartOptions: {
                    [axisKeyY]: forMultipleAxes(yAxesCount, yAxisLabelsDisabledOption),
                },
            },
            {
                condition: {
                    callback: function () {
                        const ratio = Math.round(
                            getRatio(
                                this.chartWidth,
                                this.userOptions?.plotOptions?.series?.custom?.initialPlotWidth,
                            ),
                        );
                        const result = ratio > BOTTOM_LIMIT_WIDTH_RATIO && ratio < UPPER_LIMIT_RATIO;
                        return result;
                    },
                },
                chartOptions: {
                    [axisKeyY]: forMultipleAxes(yAxesCount, yAxisTitleDisabledOption),
                },
            },
        ],
    };
};

/**
 * Responsive config for multiple charts.
 * Some charts (e.g. bar chart) have inverted axes - the x-axis stands for the y-axis and vice versa,
 * therefore is possible to use the boolean parameter "inverted" to get inverted config.
 * @param {boolean} [inverted]
 */
export const getCommonResponsiveConfig = (
    inverted: boolean = false,
    xAxesCount: number = 1,
    yAxesCount: number = 1,
): HighchartsResponsiveOptions => {
    return getResponsiveConfigOptions(inverted, xAxesCount, yAxesCount);
};

/**
 * Special responsive config is applicable for Pie chart and Donut chart.
 * Pie chart config is implicitly called from Donut chart config, therefore these configs are same.
 */
export const getPieResponsiveConfig = (): HighchartsResponsiveOptions => ({
    rules: [
        {
            condition: {
                callback: function () {
                    return (
                        (this.chartWidth > PIE_BOTTOM_LIMIT_WIDTH_PX &&
                            this.chartWidth < PIE_UPPER_LIMIT_WIDTH_PX) ||
                        (this.chartHeight > PIE_BOTTOM_LIMIT_HEIGHT_PX &&
                            this.chartHeight < PIE_UPPER_LIMIT_HEIGHT_PX)
                    );
                },
            },
            chartOptions: {
                plotOptions: {
                    gdcOptions: {
                        dataLabels: {
                            visible: "auto",
                        },
                    },
                } as any, // Modify highChart plotOption and added GD specific stuff
            },
        },
        {
            condition: {
                callback: function () {
                    return (
                        this.chartWidth < PIE_BOTTOM_LIMIT_WIDTH_PX ||
                        this.chartHeight < PIE_BOTTOM_LIMIT_HEIGHT_PX
                    );
                },
            },
            chartOptions: {
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: false,
                        },
                    },
                },
            },
        },
    ],
});
