// tslint:disable-line
/**
 * Highcharts extension that zero-aligns the scales of primary and secondary y-axes.
 * Author:  Christos Koumenides
 * Page:    https://www.highcharts.com/products/plugin-registry/single/42/Zero-align%20y-axes
 * Github:  https://github.com/chriskmnds/highcharts-zero-align-y-axes
 *
 * Modified by binh.nguyen@gooddata.com to support min/max configuration
 */

import get = require("lodash/get");
import head = require("lodash/head");
import last = require("lodash/last");
import isNil = require("lodash/isNil");
import partial = require("lodash/partial");
import { getChartType } from "../helpers";
import { isLineChart, isOneOfTypes } from "../../../utils/common";
import { supportedDualAxesChartTypes } from "../../chartOptionsBuilder";
import { dualAxesLabelFormatter } from "./dualAxesLabelFormatter";

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
    0?: IMinMaxInfo;
    1?: IMinMaxInfo;
}

const FRACTION_DIGITS = 9;

function isMinMaxCoverZero(min: number, max: number): boolean {
    return min < 0 && 0 < max;
}

/**
 * Check if user sets min or max
 * @param minmax
 * @param index
 */
function isMinMaxConfig(minmax: IMinMaxInfo[], index: number): boolean {
    return minmax[index].isSetMin || minmax[index].isSetMax;
}

function isMinMaxConfigOnAnyAxis(minmax: IMinMaxInfo[]): boolean {
    return isMinMaxConfig(minmax, 0) || isMinMaxConfig(minmax, 1);
}

/**
 * Create range from start to end without tick at zero
 * @param start
 * @param end
 * @param ticksNumber
 */
export function createArrayFromRange(start: number, end: number, ticksNumber: number): number[] {
    const result = [];
    const increase = (end - start) / (ticksNumber - 1);

    for (let i = start; i < end; i += increase) {
        result.push(i);
    }
    if (result.length < ticksNumber) {
        result.push(end);
    } else {
        result[ticksNumber - 1] = end; // overwrite last tick position by 'end'
    }
    return result;
}

/**
 * Create the range where zero is between start and end
 * @param start
 * @param end
 * @param ticksNumber
 */
export function createArrayFromRangeWithMiddleZero(
    start: number,
    end: number,
    ticksNumber: number,
): number[] {
    const delta = Math.abs((end - start) / (ticksNumber - 1));

    const negatives = getRange(start, delta);
    const positives = getRange(end, delta);

    return [...negatives, 0, ...positives];
}

/**
 * Get range from negative to zero and zero to positive
 * Negatives: start from zero down to target number, value increased by delta
 * Positives: start from zero up to target number, value increased by delta
 *
 * One extra tick will be generated for each range to make sure tick number synced on two axes
 * Extra tick will be decided to remove in 'handleOutOfRange'
 *
 * @param targetNumber
 * @param delta
 */
function getRange(targetNumber: number, delta: number): number[] {
    let position = 0;
    const result = [];

    // Use (+) to convert a string to number
    // Ref: https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
    const limit = +Math.abs(targetNumber).toFixed(FRACTION_DIGITS);
    while (position < limit) {
        position += delta;
        result.push(position);
    }

    if (targetNumber >= 0) {
        return result;
    }

    return result.reverse().map((position: number) => 0 - position);
}

function minmaxCanon(minmax: IMinMaxInfo[]): ICanon[] {
    const canon: ICanon[] = [];
    const extremes = ["min", "max"];

    minmax.forEach((item: IMinMaxInfo, i: number) => {
        canon[i] = {};
        extremes.forEach((extreme: string) => {
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
 *
 * @param minmax
 * @param minmaxLookup
 * @param axisIndex
 * @param getIndex
 * @param calculateLimit
 * @param findExtreme
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

    let newMin = minmaxLookup[axisIndex].min;
    let newMax = minmaxLookup[axisIndex].max;

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
    return { min: newMin, max: newMax };
}

export function createTickPositions(
    min: number,
    max: number,
    minmax: IMinMaxInfo[],
    tickAmount: number,
): number[] {
    if (isMinMaxCoverZero(min, max)) {
        if (isMinMaxConfig(minmax, 0) && isMinMaxConfig(minmax, 1)) {
            // disable zero-align y axis if both min/max are set to axes
            return createArrayFromRange(min, max, tickAmount);
        }
        return createArrayFromRangeWithMiddleZero(min, max, tickAmount);
    }
    return createArrayFromRange(min, max, tickAmount);
}

export function getTickAmount(tickPosition: number[]): number {
    const min = head(tickPosition);
    const max = last(tickPosition);
    const length = tickPosition.length;
    const zeroIndex = tickPosition.indexOf(0);

    // check min < 0 < max
    if (isMinMaxCoverZero(min, max) && 0 < zeroIndex && zeroIndex < length - 1) {
        return length - 1; // exclude middle zero
    }
    return length;
}

function handleInvalidMinMax(
    axisIndex: number,
    min: number,
    max: number,
    dataMin: number,
    dataMax: number,
    minmax: IMinMaxInfo[],
    isLineChartType: boolean,
) {
    if (isNil(min) || isNil(max)) {
        // mark current axis invalid
        minmax[axisIndex] = null;
        return [];
    }

    if (isLineChartType && min === max) {
        // line chart needs one tick position
        return [min];
    }

    const valueMin = Math.min(0, dataMin, dataMax);
    const valueMax = Math.max(0, dataMin, dataMax);
    // pair of min/max is out of range of data
    if (min >= max || min >= valueMax || max <= valueMin) {
        // mark current axis invalid
        minmax[axisIndex] = null;
        // nothing to render on this axis, so that hide it
        return [];
    }

    return null;
}

export function getTickPositioner() {
    // persist tick amount on the axis has larger value, then apply it to opposite axis
    let tickAmount: number = 0;
    const minmax: IMinMaxInfo[] = [];

    return function(min: number, max: number) {
        const chart = this.chart;
        const chartType = getChartType(chart);
        const isLineChartType = isLineChart(chartType);
        const currentAxisIndex = this.options.index;

        let tickPositions = handleInvalidMinMax(
            currentAxisIndex,
            min,
            max,
            this.dataMin,
            this.dataMax,
            minmax,
            isLineChartType,
        );
        if (tickPositions) {
            return tickPositions;
        }

        const yAxes = chart.axes.filter((axis: any) => axis.coll === "yAxis");
        for (const yAxisIndex in yAxes) {
            if (yAxes.hasOwnProperty(yAxisIndex)) {
                const axis = yAxes[yAxisIndex];
                if (isNil(axis.min) || isNil(axis.max)) {
                    // this axis could be not initiated (undefined) or could be invalid (null)
                    const isOtherAxisInvalid = minmax[yAxisIndex] === null;

                    const isRangeWithMiddleZero =
                        isOtherAxisInvalid &&
                        !isLineChartType && // line chart does not need middle zero
                        isMinMaxCoverZero(min, max);
                    return isRangeWithMiddleZero
                        ? createArrayFromRangeWithMiddleZero(min, max, this.tickAmount)
                        : createArrayFromRange(min, max, this.tickAmount);
                }
                minmax[yAxisIndex] = {
                    id: axis.options.index,
                    min: axis.min,
                    max: axis.max,
                    isSetMin: axis.userOptions.min !== undefined,
                    isSetMax: axis.userOptions.max !== undefined,
                };
            }
        }

        const { min: newMin, max: newMax } = getMinMax(currentAxisIndex, min, max, minmax);
        tickPositions = createTickPositions(newMin, newMax, minmax, tickAmount || this.tickAmount);

        // update tick amount to make grid lines synced on both axes
        tickAmount = Math.max(tickAmount, getTickAmount(tickPositions));

        return tickPositions;
    };
}

export function zeroAlignYAxis(Highcharts: any) {
    Highcharts.Chart.prototype.callbacks.push((chart: any) => {
        const type: string = getChartType(chart);
        if (!isOneOfTypes(type, supportedDualAxesChartTypes)) {
            return;
        }

        const axes = get(chart, "axes", []);
        const multiple = axes.length > 2 ? true : false; // 1 X axis and 2 Y axes
        if (!multiple) {
            return;
        }

        const tickPositioner = getTickPositioner();
        axes.filter(({ coll }: any) => coll === "yAxis").forEach((axis: any) =>
            axis.update(
                {
                    tickPositioner,
                    labels: { formatter: dualAxesLabelFormatter },
                },
                false,
            ),
        );

        chart.redraw();
        axes[0].update();
    });
}
