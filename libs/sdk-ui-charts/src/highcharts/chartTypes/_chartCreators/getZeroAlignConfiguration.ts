// (C) 2020-2023 GoodData Corporation
/**
 * Calculate new min/max to make Y axes aligned, and insert them to Highcharts config
 *
 * Inspired by
 *      Author:  Christos Koumenides
 *      Page:    https://www.highcharts.com/products/plugin-registry/single/42/Zero-align%20y-axes
 *      Github:  https://github.com/chriskmnds/highcharts-zero-align-y-axes
 *
 * Modified by `binh.nguyen@gooddata.com` to support min/max configuration
 */

import partial from "lodash/partial.js";
import isNil from "lodash/isNil.js";
import zip from "lodash/zip.js";
import sum from "lodash/sum.js";
import compact from "lodash/compact.js";

import { isComboChart, isLineChart } from "../_util/common.js";
import { StackingType } from "../../constants/stacking.js";
import { IChartOptions, IHighChartAxis, ISeriesDataItem, ISeriesItem } from "../../typings/unsafe.js";

export interface ICanon {
    min?: number;
    max?: number;
}

export type IMinMax = ICanon;

export interface IMinMaxInfo extends ICanon {
    id: number;
    isSetMin: boolean;
    isSetMax: boolean;
}

export interface IMinMaxLookup {
    [key: number]: IMinMaxInfo;
}

/**
 * Check if user sets min or max
 */
function isMinMaxConfig(minmax: IMinMaxInfo[], index: number): boolean {
    return minmax[index].isSetMin || minmax[index].isSetMax;
}

function isMinMaxConfigOnAnyAxis(minmax: IMinMaxInfo[]): boolean {
    return isMinMaxConfig(minmax, 0) || isMinMaxConfig(minmax, 1);
}

function minmaxCanon(minmax: IMinMaxInfo[]): ICanon[] {
    const canon: ICanon[] = [];
    const extremes: (keyof ICanon)[] = ["min", "max"];

    minmax.forEach((item: IMinMaxInfo, i: number) => {
        canon[i] = {} as Record<keyof ICanon, number>;
        extremes.forEach((extreme) => {
            if (item[extreme] === 0) {
                canon[i][extreme] = 0;
            } else if (item[extreme] > 0) {
                canon[i][extreme] = 1;
            } else {
                canon[i][extreme] = -1;
            }
        });
    });

    return canon;
}

function getMinMaxLookup(minmax: IMinMaxInfo[]): IMinMaxLookup {
    return minmax.reduce((result: IMinMaxLookup, item: IMinMaxInfo) => {
        result[item.id] = item;
        return result;
    }, {});
}

function calculateMin(
    idx: number,
    minmax: IMinMaxInfo[],
    minmaxLookup: IMinMaxLookup,
    axisIndex: number,
): number {
    const fraction = !minmax[idx].max
        ? minmax[idx].min // handle divide zero case
        : minmax[idx].min / minmax[idx].max;
    return fraction * minmaxLookup[axisIndex].max;
}

function calculateMax(
    idx: number,
    minmax: IMinMaxInfo[],
    minmaxLookup: IMinMaxLookup,
    axisIndex: number,
): number {
    const fraction = !minmax[idx].min
        ? minmax[idx].max // handle divide zero case
        : minmax[idx].max / minmax[idx].min;
    return fraction * minmaxLookup[axisIndex].min;
}

/**
 * Calculate min or max and return it
 *
 * For min, the calculation is based on axis having smallest min in case having min/max setting
 * Otherwise, it is calculated base on axis having smaller min
 *
 * For max, the calculation is base on axis having largest max in case having min/max setting
 * Otherwise, it is calculated base on axis having larger max
 */
function getLimit(
    minmax: IMinMaxInfo[],
    minmaxLookup: IMinMaxLookup,
    axisIndex: number,
    getIndex: (...params: any[]) => any, // TODO: make the types more specific (FET-282)
    calculateLimit: (...params: any[]) => any, // TODO: make the types more specific (FET-282)
    findExtreme: (...params: any[]) => any, // TODO: make the types more specific (FET-282)
): number {
    const isMinMaxConfig = isMinMaxConfigOnAnyAxis(minmax);
    if (isMinMaxConfig) {
        const idx = getIndex(minmax);
        return calculateLimit(idx, minmax, minmaxLookup, axisIndex);
    }
    return findExtreme([0, 1].map((index: number) => calculateLimit(index, minmax, minmaxLookup, axisIndex)));
}

export function getMinMax(axisIndex: number, min: number, max: number, minmax: IMinMaxInfo[]): IMinMax {
    const minmaxLookup: IMinMaxLookup = getMinMaxLookup(minmax);
    const axesCanon: ICanon[] = minmaxCanon(minmax);

    const getLimitPartial = partial(getLimit, minmax, minmaxLookup, axisIndex);

    let { min: newMin, max: newMax } = minmaxLookup[axisIndex];
    const { isSetMin, isSetMax } = minmaxLookup[axisIndex];

    if (axesCanon[0].min <= 0 && axesCanon[0].max <= 0 && axesCanon[1].min <= 0 && axesCanon[1].max <= 0) {
        // set 0 at top of chart
        // ['----', '-0--', '---0']
        newMax = Math.min(0, max);
    } else if (
        axesCanon[0].min >= 0 &&
        axesCanon[0].max >= 0 &&
        axesCanon[1].min >= 0 &&
        axesCanon[1].max >= 0
    ) {
        // set 0 at bottom of chart
        // ['++++', '0+++', '++0+']
        newMin = Math.max(0, min);
    } else if (axesCanon[0].max === axesCanon[1].max) {
        newMin = getLimitPartial(
            (minmax: IMinMaxInfo[]) => (minmax[0].min <= minmax[1].min ? 0 : 1),
            calculateMin,
            (minOnAxes: number[]) => Math.min(minOnAxes[0], minOnAxes[1]),
        );
    } else if (axesCanon[0].min === axesCanon[1].min) {
        newMax = getLimitPartial(
            (minmax: IMinMaxInfo[]) => (minmax[0].max > minmax[1].max ? 0 : 1),
            calculateMax,
            (maxOnAxes: number[]) => Math.max(maxOnAxes[0], maxOnAxes[1]),
        );
    } else {
        // set 0 at center of chart
        // ['--++', '-0++', '--0+', '-00+', '++--', '++-0', '0+--', '0+-0']
        if (minmaxLookup[axisIndex].min < 0) {
            newMax = Math.abs(newMin);
        } else {
            newMin = 0 - newMax;
        }
    }

    return {
        min: isSetMin ? minmaxLookup[axisIndex].min : newMin,
        max: isSetMax ? minmaxLookup[axisIndex].max : newMax,
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getMinMaxInfo(config: any, stacking: StackingType, type: string): IMinMaxInfo[] {
    const { series, yAxis } = config;
    const isStackedChart = !isNil(stacking);

    return yAxis.map((axis: IHighChartAxis, axisIndex: number): IMinMaxInfo => {
        const isLineChartOnAxis = isLineChartType(series, axisIndex, type);
        const seriesOnAxis = getSeriesOnAxis(series, axisIndex);
        const { min, max, opposite } = axis;

        const { min: dataMin, max: dataMax } =
            isStackedChart && !isLineChartOnAxis
                ? getDataMinMaxOnStackedChart(seriesOnAxis, stacking, opposite)
                : getDataMinMax(seriesOnAxis, isLineChartOnAxis);

        return {
            id: axisIndex,
            min: isNil(min) ? dataMin : min,
            max: isNil(max) ? dataMax : max,
            isSetMin: min !== undefined,
            isSetMax: max !== undefined,
        };
    });
}

/**
 * Get series on related axis
 */
function getSeriesOnAxis(series: ISeriesItem[], axisIndex: number): ISeriesItem[] {
    return series.filter((item: ISeriesItem): boolean => item.yAxis === axisIndex);
}

/**
 * Get y value in series
 */
function getYDataInSeries(series: ISeriesItem): number[] {
    return series.data.map((item: ISeriesDataItem): number => item.y);
}

/**
 * Convert table of y value from row-view
 * [
 *  [1, 2, 3],
 *  [4, 5, 6]
 * ]
 * to column-view
 * [
 *  [1, [2, [3,
 *   4]  5]  6]
 * ]
 */
function getStackedYData(yData: number[][]): number[][] {
    return zip(...yData);
}

/**
 * Get extreme on columns
 * [
 *  [1, [2, [3,
 *   4]  5]  6]
 * ]
 */
function getColumnExtremes(columns: number[]): IMinMax {
    return columns.reduce(
        (result: IMinMax, item: number): IMinMax => {
            const extreme = item < 0 ? "min" : "max";
            result[extreme] += item;
            return result;
        },
        { min: 0, max: 0 },
    );
}

function getStackedDataMinMax(yData: number[][]): IMinMax {
    const isEmpty = yData.length === 0;
    let min = isEmpty ? 0 : Number.POSITIVE_INFINITY;
    let max = isEmpty ? 0 : Number.NEGATIVE_INFINITY;

    yData.forEach((column: number[]) => {
        const { min: columnDataMin, max: columnDataMax } = getColumnExtremes(column);
        min = Math.min(min, columnDataMin);
        max = Math.max(max, columnDataMax);
    });

    return { min, max };
}

/**
 * Convert number to percent base on total of column
 * From
 *  [
 *      [1, [3, [4, [null,  [20,
 *       4]  7] -6]  null],  null]
 *  ]
 * to
 *  [
 *      [20, [30, [40, [  , [100
 *       80]  70] -60]  ]      ]
 *  ]
 */
export function convertNumberToPercent(yData: number[][]): number[][] {
    return yData.map((columns: number[]) => {
        const columnsWithoutNull = compact(columns); // remove null values
        const total = sum(columnsWithoutNull.map((num: number) => Math.abs(num)));
        return columnsWithoutNull.map((num: number) => (num / total) * 100);
    });
}

/**
 * Get data min/max in stacked chart
 * By comparing total of positive value to get max and total of negative value to get min
 */
function getDataMinMaxOnStackedChart(
    series: ISeriesItem[],
    stacking: StackingType,
    opposite: boolean,
): IMinMax {
    const yData = series.map(getYDataInSeries);
    const stackedYData = getStackedYData(yData);
    if (stacking === "percent" && !opposite) {
        const percentData = convertNumberToPercent(stackedYData);
        return getStackedDataMinMax(percentData);
    }
    return getStackedDataMinMax(stackedYData);
}

/**
 * Get data min/max in normal chart
 * By comparing min max value in all series in axis
 */
function getDataMinMax(series: ISeriesItem[], isLineChart: boolean): IMinMax {
    const { min, max } = series.reduce(
        (result: IMinMax, item: ISeriesItem): IMinMax => {
            const yData = getYDataInSeries(item);
            return {
                min: Math.min(result.min, ...yData),
                max: Math.max(result.max, ...yData),
            };
        },
        {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY,
        },
    );
    return {
        min: isLineChart ? min : Math.min(0, min),
        max: isLineChart ? max : Math.max(0, max),
    };
}

function isLineChartType(series: ISeriesItem[], axisIndex: number, type: string): boolean {
    if (isLineChart(type)) {
        return true;
    }
    if (isComboChart(type)) {
        return getSeriesOnAxis(series, axisIndex).every((item: ISeriesItem) => isLineChart(item.type));
    }
    return false;
}

function getExtremeByChartTypeOnAxis(
    extreme: number,
    series: ISeriesItem[],
    axisIndex: number,
    type: string,
): number {
    const isLineChartOnAxis = isLineChartType(series, axisIndex, type);
    if (isLineChartOnAxis) {
        return extreme;
    }
    return Math.min(0, extreme);
}

/**
 * Check whether axis has invalid min/max
 */
function hasInvalidAxis(minmax: IMinMaxInfo[]): boolean {
    return minmax.reduce((result: boolean, item: IMinMaxInfo) => {
        const { min, max } = item;
        if (min >= max) {
            return true;
        }
        return result;
    }, false);
}

/**
 * Hide invalid axis by setting 'visible' to false
 */
function hideInvalidAxis(config: any, minmax: IMinMaxInfo[], type: string) {
    const series: ISeriesItem[] = config.series.map((item: ISeriesItem) => {
        const { yAxis, type } = item;
        return type ? { yAxis, type } : { yAxis };
    });

    const yAxis: Array<Partial<IHighChartAxis>> = minmax.map((item: IMinMaxInfo, index: number) => {
        const isLineChartOnAxis = isLineChartType(series, index, type);
        const { min, max } = item;

        const shouldInvisible = isLineChartOnAxis ? min > max : min >= max;
        if (shouldInvisible) {
            return {
                visible: false,
            };
        }

        return {};
    });

    yAxis.forEach((axis: Partial<IHighChartAxis>, index: number) => {
        const { visible } = axis;
        if (visible === false) {
            series.forEach((item: ISeriesItem) => {
                if (item.yAxis === index) {
                    item.visible = false;
                }
            });
        }
    });

    return { yAxis, series };
}

/**
 * Calculate new min/max to make Y axes aligned
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getZeroAlignConfiguration(chartOptions: IChartOptions, config: any): any {
    const { stacking, type } = chartOptions;
    const { yAxis } = config;
    const isDualAxis = (yAxis || []).length === 2;

    if (!isDualAxis) {
        return {};
    }

    const minmax: IMinMaxInfo[] = getMinMaxInfo(config, stacking, type);

    if (hasInvalidAxis(minmax)) {
        return hideInvalidAxis(config, minmax, type);
    }

    if (minmax[0].isSetMin && minmax[0].isSetMax && minmax[1].isSetMin && minmax[1].isSetMax) {
        // take user-input min/max, no need to calculate
        // this 'isUserMinMax' acts as a flag,
        // so that 'adjustTickAmount' plugin knows this min/max is either user input or calculated
        return {
            yAxis: [
                {
                    isUserMinMax: true,
                },
                {
                    isUserMinMax: true,
                },
            ],
        };
    }

    // calculate min/max on both Y axes and set it to HighCharts yAxis config
    const yAxisWithMinMax = [0, 1].map((axisIndex: number) => {
        const { min, max } = minmax[axisIndex];
        const newMinMax = getMinMax(
            axisIndex,
            getExtremeByChartTypeOnAxis(min, config.series, axisIndex, type),
            getExtremeByChartTypeOnAxis(max, config.series, axisIndex, type),
            minmax,
        );
        return {
            isUserMinMax: minmax[axisIndex].isSetMin || minmax[axisIndex].isSetMax,
            ...newMinMax,
        };
    });

    return {
        yAxis: yAxisWithMinMax,
    };
}
