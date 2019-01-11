// (C) 2007-2018 GoodData Corporation
import partial = require('lodash/partial');
import merge = require('lodash/merge');
import includes = require('lodash/includes');
import isNil = require('lodash/isNil');
import set = require('lodash/set');
import { IChartConfig } from '../../../../interfaces/Config';
import { IAxis, IChartOptions, supportedStackingAttributesChartTypes } from '../chartOptionsBuilder';
import { formatAsPercent } from './customConfiguration';
import { isBarChart, isColumnChart } from '../../utils/common';

export const NORMAL_STACK = 'normal';
export const PERCENT_STACK = 'percent';

function handleStackMeasure(stackMeasures: boolean, item: any) {
    return stackMeasures ? {
        ...item,
        stacking: NORMAL_STACK,
        stack: item.yAxis
    } : item;
}

function handleStackMeasuresToPercent(stackMeasuresToPercent: boolean, item: any) {
    return stackMeasuresToPercent ? {
        ...item,
        stacking: PERCENT_STACK,
        stack: item.yAxis
    } : item;
}

function handleDualAxes(isDualAxes: boolean, item: any) {
    if (!isDualAxes) {
        return item;
    }

    const { stacking, yAxis } = item;
    const isFirstAxis = yAxis === 0;

    // highcharts stack config
    // percent stack is only applied to primary Y axis
    const hcStackingConfig = stacking ? { stacking: isFirstAxis ? stacking : NORMAL_STACK } : {};

    return {
        ...item,
        ...hcStackingConfig
    };
}

function getSeriesConfiguration(
    config: any,
    stackMeasures: boolean,
    stackMeasuresToPercent: boolean,
    isDualAxes: boolean
) {
    const { series } = config;
    const handlers: Function[] = [
        partial(handleStackMeasure, stackMeasures),
        partial(handleStackMeasuresToPercent, stackMeasuresToPercent),
        partial(handleDualAxes, isDualAxes)
    ];

    return {
        series: series.map((item: any) => (handlers.reduce((result: any, handler: Function) => handler(result), item)))
    };
}

function getYAxisConfiguration(
    config: any,
    type: string,
    isDualAxes: boolean
) {
    const { yAxis } = config;
    // let it be default for single axis chart
    // and bar chart disables stack labels by default
    if (!isDualAxes || !isColumnChart(type)) {
        return {};
    }

    return {
        yAxis: yAxis.map((axis: any) => ({
            ...axis,
            stackLabels: {
                enabled: true, // enabled by default (fallback value in case dataLabels.visible is undefined)
                ...axis.stackLabels // follow dataLabels.visible config
            }
        }))
    };
}

/**
 * Set config to highchart for 'Stack Measures' and 'Stack to 100%'
 * @param chartOptions
 * @param config
 * @param chartConfig
 */
export function getStackMeasuresConfiguration(chartOptions: any, config: any, chartConfig: IChartConfig) {
    const { stackMeasures = false, stackMeasuresToPercent = false } = chartConfig;
    if (!stackMeasures && !stackMeasuresToPercent) {
        return {};
    }

    const { yAxes, type } = chartOptions;
    const isDualAxes = yAxes.length === 2;

    return {
        stackMeasuresToPercent, // this prop is used in 'dualAxesLabelFormatter.ts'
        ...getSeriesConfiguration(config, stackMeasures, stackMeasuresToPercent, isDualAxes),
        ...getYAxisConfiguration(config, type, isDualAxes)
    };
}

/**
 * Add style to X axis in case of 'grouped-categories'
 * @param chartOptions
 * @param config
 */
export function getParentAttributeConfiguration(chartOptions: IChartOptions, config: any) {
    const { type } = chartOptions;
    const { xAxis } = config;
    const xAxisItem = xAxis[0]; // expect only one X axis

    // parent attribute in X axis
    const parentAttributeOptions = {};

    // only apply font-weight to parent label
    set(parentAttributeOptions, 'style', {
        fontWeight: 'bold'
    });

    if (isBarChart(type)) {
        // distance more 5px for two groups of attributes for bar chart
        set(parentAttributeOptions, 'x', -5);
    }

    // 'groupedOptions' is custom property in 'grouped-categories' plugin
    set(xAxisItem, 'labels.groupedOptions', [parentAttributeOptions]);

    return { xAxis: [xAxisItem] };
}

/**
 * Format labels in Y axis from '0 - 100' to '0% - 100%'
 * @param chartOptions
 * @param _
 * @param chartConfig
 */
export function getShowInPercentConfiguration(chartOptions: IChartOptions, _: any, chartConfig: IChartConfig) {
    const { stackMeasuresToPercent = false } = chartConfig;
    if (!stackMeasuresToPercent) {
        return {};
    }

    const { yAxes = [] } = chartOptions;
    const yAxis = yAxes.map((axis: IAxis) => ({
            ...axis,
            labels: {
                formatter: partial(formatAsPercent, 1)
            }
        })
    );
    return { yAxis };
}

/**
 * Convert [0, 1] to [0, 100], it's needed by highchart
 * Only applied to primary Y axis
 * @param chartOptions
 * @param _
 * @param chartConfig
 */
export function convertMinMaxFromPercentToNumber(_: IChartOptions, config: any, chartConfig: IChartConfig) {
    const { stackMeasuresToPercent = false } = chartConfig;
    if (!stackMeasuresToPercent) {
        return {};
    }

    const { yAxis: yAxes = [] as any[] } = config;
    const yAxis = yAxes.map((axis: any, _: number, axes: IAxis[]) => {
        const { min, max } = axis;

        const newMinMax = {};
        if (!isNil(min)) {
            set(newMinMax, 'min', min * 100);
        }

        if (!isNil(max)) {
            set(newMinMax, 'max', max * 100);
        }

        const convertedAxis = {
            ...axis,
            ...newMinMax
        };

        const numberOfAxis = axes.length;
        if (numberOfAxis === 1) {
            return convertedAxis;
        }

        const { opposite = false } = axis;
        return opposite ? axis : convertedAxis;
    });

    return { yAxis };
}

export default function getOptionalStackingConfiguration(
    chartOptions: IChartOptions,
    config: any,
    chartConfig: IChartConfig = {}
) {
    const { type } = chartOptions;
    return includes(supportedStackingAttributesChartTypes, type) ? merge(
    {},
        getParentAttributeConfiguration(chartOptions, config),
        getStackMeasuresConfiguration(chartOptions, config, chartConfig),
        getShowInPercentConfiguration(chartOptions, config, chartConfig),
        convertMinMaxFromPercentToNumber(chartOptions, config, chartConfig)
    ) : {};
}
