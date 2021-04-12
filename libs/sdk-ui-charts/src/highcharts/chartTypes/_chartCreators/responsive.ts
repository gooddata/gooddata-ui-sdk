// (C) 2007-2021 GoodData Corporation
import { ResponsiveOptions } from "highcharts";
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
const getResponsiveConfigOptions = (inverted: boolean): HighchartsResponsiveOptions => {
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
                        const heightRatio = Math.round(getRatio(this.chartHeight, this.plotHeight));
                        const widthRatio = Math.round(getRatio(this.chartWidth, this.plotWidth));
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
                    [axisKeyX]: {
                        ...xAxisLabelsDisabledOption,
                    },
                    [axisKeyY]: {
                        ...yAxisLabelsDisabledOption,
                    },
                },
            },
            {
                condition: {
                    callback: function () {
                        const ratio = Math.round(getRatio(this.chartHeight, this.plotHeight));
                        return ratio < BOTTOM_LIMIT_HEIGHT_RATIO;
                    },
                },
                chartOptions: {
                    [axisKeyX]: {
                        ...xAxisLabelsDisabledOption,
                    },
                },
            },
            {
                condition: {
                    callback: function () {
                        const ratio = Math.round(getRatio(this.chartHeight, this.plotHeight));
                        return ratio > BOTTOM_LIMIT_HEIGHT_RATIO && ratio < UPPER_LIMIT_RATIO;
                    },
                },
                chartOptions: {
                    [axisKeyX]: {
                        ...xAxisTitleDisabledOption,
                    },
                },
            },
            {
                condition: {
                    callback: function () {
                        const ratio = Math.round(getRatio(this.chartWidth, this.plotWidth));
                        return ratio < BOTTOM_LIMIT_WIDTH_RATIO;
                    },
                },
                chartOptions: {
                    [axisKeyY]: {
                        ...yAxisLabelsDisabledOption,
                    },
                },
            },
            {
                condition: {
                    callback: function () {
                        const ratio = Math.round(getRatio(this.chartWidth, this.plotWidth));
                        return ratio > BOTTOM_LIMIT_WIDTH_RATIO && ratio < UPPER_LIMIT_RATIO;
                    },
                },
                chartOptions: {
                    [axisKeyY]: {
                        ...yAxisTitleDisabledOption,
                    },
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
export const getCommonResponsiveConfig = (inverted: boolean = false): HighchartsResponsiveOptions => {
    return getResponsiveConfigOptions(inverted);
};

/**
 * Special responsive config is applicable for Pie chart and Donut chart.
 * Pie chart config is implicitly called from Donut chart config, therefore these configs are same.
 */
export const getPieResponsiveConfig = (): ResponsiveOptions => ({
    rules: [
        {
            condition: {
                callback: function () {
                    return (
                        (this.plotWidth > PIE_BOTTOM_LIMIT_WIDTH_PX &&
                            this.plotWidth < PIE_UPPER_LIMIT_WIDTH_PX) ||
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
                        this.plotWidth < PIE_BOTTOM_LIMIT_WIDTH_PX ||
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
