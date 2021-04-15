// (C) 2007-2021 GoodData Corporation
import { HighchartsResponsiveOptions, XAxisOptions, YAxisOptions } from "../../../highcharts/lib";

const UPPER_LIMIT = 35;
const BOTTOM_LIMIT = 15;
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

export const getCommonResponsiveConfig = (): HighchartsResponsiveOptions => ({
    rules: [
        {
            condition: {
                callback: function () {
                    const ratio = Math.round(getRatio(this.chartHeight, this.plotHeight));
                    // console.log("this", this);
                    // console.log("ration condition 1", ratio);
                    return ratio < BOTTOM_LIMIT;
                },
            },
            chartOptions: {
                xAxis: {
                    ...xAxisLabelsDisabledOption,
                },
            },
        },
        {
            condition: {
                callback: function () {
                    const ratio = Math.round(getRatio(this.chartHeight, this.plotHeight));
                    // console.log("ration condition 2", ratio);
                    return ratio > BOTTOM_LIMIT && ratio < UPPER_LIMIT;
                },
            },
            // todo: chart with isViewByTwoAttributes has set to off title in customConfiguration.ts...probably we will need to change the logic
            // so far i removed this "config" because of test purposes
            chartOptions: {
                xAxis: {
                    ...xAxisTitleDisabledOption,
                },
            },
        },

        // WIDTH
        // todo: for width, we will need different limits probably
        {
            condition: {
                callback: function () {
                    const ratio = Math.round(getRatio(this.chartWidth, this.plotWidth));
                    // console.log("ration condition 3", ratio);
                    return ratio < BOTTOM_LIMIT;
                },
            },
            chartOptions: {
                yAxis: {
                    ...yAxisLabelsDisabledOption,
                },
            },
        },
        {
            condition: {
                callback: function () {
                    const ratio = Math.round(getRatio(this.chartWidth, this.plotWidth));
                    // console.log("ration condition 4", ratio);
                    return ratio > BOTTOM_LIMIT && ratio < UPPER_LIMIT;
                },
            },
            chartOptions: {
                yAxis: {
                    ...yAxisTitleDisabledOption,
                },
            },
        },
    ],
});

export const getCommonResponsiveConfigReversed = (): HighchartsResponsiveOptions => ({
    rules: [
        {
            condition: {
                callback: function () {
                    const ratio = Math.round(getRatio(this.chartHeight, this.plotHeight));
                    // console.log("ration condition 1", ratio);
                    return ratio < BOTTOM_LIMIT;
                },
            },
            chartOptions: {
                yAxis: {
                    ...yAxisLabelsDisabledOption,
                },
            },
        },
        {
            condition: {
                callback: function () {
                    const ratio = Math.round(getRatio(this.chartHeight, this.plotHeight));
                    // console.log("ration condition 2", ratio);
                    return ratio > BOTTOM_LIMIT && ratio < UPPER_LIMIT;
                },
            },
            chartOptions: {
                yAxis: {
                    ...yAxisTitleDisabledOption,
                },
            },
        },
        {
            condition: {
                callback: function () {
                    const ratio = Math.round(getRatio(this.chartWidth, this.plotWidth));
                    // console.log("ration condition 3", ratio);
                    return ratio < BOTTOM_LIMIT;
                },
            },
            chartOptions: {
                xAxis: {
                    ...xAxisLabelsDisabledOption,
                },
            },
        },
        {
            condition: {
                callback: function () {
                    const ratio = Math.round(getRatio(this.chartWidth, this.plotWidth));
                    // console.log("ration condition 4", ratio);
                    return ratio > BOTTOM_LIMIT && ratio < UPPER_LIMIT;
                },
            },
            chartOptions: {
                xAxis: {
                    ...xAxisTitleDisabledOption,
                },
            },
        },
    ],
});
