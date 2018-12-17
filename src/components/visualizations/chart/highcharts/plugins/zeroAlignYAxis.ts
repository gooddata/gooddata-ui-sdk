// tslint:disable-line
/**
 * Highcharts extension that zero-aligns the scales of primary and secondary y-axes.
 * Author:  Christos Koumenides
 * Page:    https://www.highcharts.com/products/plugin-registry/single/42/Zero-align%20y-axes
 * Github:  https://github.com/chriskmnds/highcharts-zero-align-y-axes
 *
 * Modified by binh.nguyen@gooddata.com to support min/max configuration
 */

import get = require('lodash/get');
import initial = require('lodash/initial');
import tail = require('lodash/tail');
import { getChartType } from '../helpers';
import { isOneOfTypes } from '../../../utils/common';
import { supportedDualAxesChartTypes } from '../../chartOptionsBuilder';
import { dualAxesLabelFormatter } from './dualAxesLabelFormatter';

export interface ICanon {
    min?: number;
    max?: number;
}

export interface IMinMaxInfo extends ICanon {
    id: number;
    isSetMin: boolean;
    isSetMax: boolean;
}

export interface IMinMaxLookup {
    0?: IMinMaxInfo;
    1?: IMinMaxInfo;
}

/**
 * Check if user sets min or max
 * @param minmax
 * @param index
 */
function isMinMaxConfig(minmax: IMinMaxInfo[], index: number) {
    return minmax[index].isSetMin || minmax[index].isSetMax;
}

/**
 * Create range from start to end without tick at zero
 * @param start
 * @param end
 * @param ticksNumber
 */
export function createArrayFromRange(start: number, end: number, ticksNumber: number) {
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
 * Remove elements out of range
 *
 * negatives: [-50, -40, -30, -20 , -10]
 * positives: [10, 20, 30, 40, 50, 60]
 * tick number: 8
 *
 * result: [[-40, -30, -20 , -10], [10, 20, 30, 40]]
 *
 * @param negatives
 * @param positives
 * @param ticksNumber
 */
function handleOutOfRange(negatives: number[], positives: number[], ticksNumber: number) {
    let cloneNegatives = [...negatives];
    let clonePositives = [...positives];
    while (cloneNegatives.length + clonePositives.length > ticksNumber) {
        if (cloneNegatives.length >= clonePositives.length) {
            cloneNegatives = tail(cloneNegatives);
        } else {
            clonePositives = initial(clonePositives);
        }
    }
    return [cloneNegatives, clonePositives];
}

/**
 * create the range where zero is between start and end
 * @param start
 * @param end
 * @param ticksNumber
 */
export function createArrayFromRangeWithMiddleZero(start: number, end: number, ticksNumber: number) {
    const delta = Math.abs((end - start) / (ticksNumber - 1));
    const [negatives, positives] = handleOutOfRange(
        getRange(start, delta),
        getRange(end, delta),
        ticksNumber
    );

    return negatives.concat([0], positives);
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
function getRange(targetNumber: number, delta: number) {
    let position = 0;
    const result = [];

    const limit = Math.abs(targetNumber) + delta; // add 'delta' to generate extra tick
    while (position < limit) {
        position += delta;
        result.push(position);
    }

    if (targetNumber >= 0) {
        return result;
    }

    return result.reverse().map((position: number) => {
        return 0 - position;
    });
}

function minmaxCanon(minmax: IMinMaxInfo[]): ICanon[] {
    const canon: ICanon[] = [];
    const extremes = ['min', 'max'];

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

/**
 * New min is calculated base on axis having smallest min
 * @param minmax
 * @param minmaxLookup
 * @param axisIndex
 */
function getNewMin(minmax: IMinMaxInfo[], minmaxLookup: IMinMaxLookup, axisIndex: number) {
    const idx = (minmax[0].min <= minmax[1].min) ? 0 : 1;
    const f = !minmax[idx].max ?
                    minmax[idx].min : // handle divide zero case
                    minmax[idx].min / minmax[idx].max;
    return f * minmaxLookup[axisIndex].max;
}

/**
 * New max is calculated base on axis having largest max
 * @param minmax
 * @param minmaxLookup
 * @param axisIndex
 */
function getNewMax(minmax: IMinMaxInfo[], minmaxLookup: IMinMaxLookup, axisIndex: number) {
    const idx = (minmax[0].max > minmax[1].max) ? 0 : 1;
    const f = !minmax[idx].min ?
                    minmax[idx].max : // handle divide zero case
                    minmax[idx].max / minmax[idx].min;
    return f * minmaxLookup[axisIndex].min;
}

export function getMinMax(axisIndex: number, min: number, max: number, minmax: IMinMaxInfo[]) {
    const minmaxLookup: IMinMaxLookup = getMinMaxLookup(minmax);
    const axesCanon: ICanon[] = minmaxCanon(minmax);

    let newMin = minmaxLookup[axisIndex].min;
    let newMax = minmaxLookup[axisIndex].max;

    if (axesCanon[0].min <= 0 && axesCanon[0].max <= 0 &&
        axesCanon[1].min <= 0 && axesCanon[1].max <= 0) {
        // set 0 at top of chart
        // ['----', '-0--', '---0']
        newMax = Math.min(0, max);
    } else if (axesCanon[0].min >= 0 && axesCanon[0].max >= 0 &&
        axesCanon[1].min >= 0 && axesCanon[1].max >= 0) {
        // set 0 at bottom of chart
        // ['++++', '0+++', '++0+']
        newMin = Math.max(0, min);
    } else if (axesCanon[0].max === axesCanon[1].max) {
        // set min equal to the min/max fraction of smallest axis
        // ['-+-+', '-+++', '-+0+', '++-+', '0+-+']
        newMin = getNewMin(minmax, minmaxLookup, axisIndex);
    } else if (axesCanon[0].min === axesCanon[1].min) {
        // set max equal to the max/min fraction of largest axis
        // ['-+--','-+-0',  '---+', '-0-+']
        newMax = getNewMax(minmax, minmaxLookup, axisIndex);
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

function getMinMaxLookup(minmax: IMinMaxInfo[]): IMinMaxLookup {
    return minmax.reduce((result: IMinMaxLookup, item: IMinMaxInfo) => {
        result[item.id] = item;
        return result;
    }, {});
}

export function createTickPositions(min: number, max: number, minmax: IMinMaxInfo[], tickAmount: number) {
    if (min < 0 && max > 0) {
        if (isMinMaxConfig(minmax, 0) && isMinMaxConfig(minmax, 1)) {
            // disable zero-align y axis if both min/max are set to axes
            return createArrayFromRange(min, max, tickAmount);
        }
        return createArrayFromRangeWithMiddleZero(min, max, tickAmount);
    }
    return createArrayFromRange(min, max, tickAmount);
}

function getTickPositioner() {
    let minmax: IMinMaxInfo[];

    return function(min: number, max: number) {
        if (typeof min === 'undefined' || min === null || typeof max === 'undefined' || max === null) {
            return;
        }

        const dataMin = Math.min(0, this.dataMin, this.dataMax);
        const dataMax = Math.max(0, this.dataMin, this.dataMax);
        if (min === max || min >= dataMax || max <= dataMin) {
            const tickNum = this.tickPositions.length;
            if (tickNum === 1 && this.tickPositions[0] === 0) {
                // nothing to render on this axis
                return [];
            }
            return tickNum ? createArrayFromRange(min, max, this.tickAmount) : this.tickPositions;
        }

        const chart = this.chart;

        if (!minmax) {
            // ----------------------------
            // Computed once for both axes
            // ----------------------------
            minmax = [];

            for (const axis of chart.axes) {
                if (axis.coll === 'yAxis') {
                    if (typeof axis.max === 'undefined' || axis.max === null ||
                        typeof axis.min === 'undefined' || axis.min === null) {
                        // Don't have min/max values for both axes yet.
                        // Clean up processed values from other axis.
                        minmax = undefined;
                        // Exit. Process in next call.
                        return createArrayFromRange(min, max, this.tickAmount);
                    }
                    minmax.push({
                        id: axis.options.index,
                        min: axis.min,
                        max: axis.max,
                        isSetMin: axis.userOptions.min !== undefined,
                        isSetMax: axis.userOptions.max !== undefined
                    });
                }
            }
        }

        const { min: newMin, max: newMax } = getMinMax(this.options.index, min, max, minmax);
        return createTickPositions(newMin, newMax, minmax, this.tickAmount);
    };
}

export function zeroAlignYAxis(Highcharts: any) {
    Highcharts.Chart.prototype.callbacks.push((chart: any) => {
        const type: string = getChartType(chart);
        if (!isOneOfTypes(type, supportedDualAxesChartTypes)) {
            return;
        }

        const axes = get(chart, 'axes', []);
        const multiple = (axes.length > 2 ? true : false); // 1 X axis and 2 Y axes
        if (!multiple) {
            return;
        }

        const tickPositioner = getTickPositioner();
        axes
            .filter(({ coll }: any) => coll === 'yAxis')
            .forEach((axis: any) => axis.update({
                tickPositioner,
                labels: { formatter: dualAxesLabelFormatter }
            }, false));

        chart.redraw();
        axes[0].update();
    });
}
