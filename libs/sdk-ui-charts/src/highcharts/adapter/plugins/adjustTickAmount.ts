// (C) 2020-2023 GoodData Corporation
/**
 * Highcharts extension that overwrites 'axis.adjustTickAmount' of Highcharts
 * Original code snippet
 *      https://github.com/highcharts/highcharts/blob/b54fe33d91c0d1fd7da009aaa84af694f15cffad/js/parts/Axis.js#L4214
 *
 * Modified by `binh.nguyen@gooddata.com` to support zero alignment
 *
 * Relying on undocumented internal properties of Highcharts.Axis
 *  - visible
 *  - tickAmount
 *  - tickInterval
 *  - transA
 *  - opposite
 */

import isNil from "lodash/isNil.js";
import isArray from "lodash/isArray.js";
import Highcharts from "../../lib/index.js";
import { isLineChart } from "../../chartTypes/_util/common.js";
import { UnsafeInternals } from "../../typings/unsafe.js";

interface IBaseAndAlignedAxes {
    baseYAxis: Highcharts.Axis;
    alignedYAxis: Highcharts.Axis;
}

export const ALIGNED = 0;
export const MOVE_ZERO_LEFT = -1;
export const MOVE_ZERO_RIGHT = 1;

export const Y_AXIS_SCORE = {
    NO_DATA: 0,
    ONLY_NEGATIVE_OR_POSITIVE_DATA: 1,
    NEGATIVE_AND_POSITIVE_DATA: 2,
};

function getYAxes(chart: Highcharts.Chart): Highcharts.Axis[] {
    return chart.axes.filter(isYAxis);
}

function isYAxis(axis: Highcharts.Axis): boolean {
    return axis.coll === "yAxis";
}

/**
 * Check if user sets min/max on any axis
 * @returns true if any axis is set min/max to. Otherwise false
 */
function isUserSetExtremesOnAnyAxis(chart: Highcharts.Chart): boolean {
    const yAxes = chart.userOptions.yAxis;
    if (yAxes && isArray(yAxes)) {
        // isUserMinMax is a custom prop not included in original typing
        return (yAxes[0] as any).isUserMinMax || (yAxes[1] as any).isUserMinMax;
    }
}

/**
 * Get direction to make secondary axis align to primary axis
 * @returns
 *     -1: move zero index to left
 *      0: it aligns
 *      1: move zero index to right
 */
export function getDirection(primaryAxis: Highcharts.Axis, secondaryAxis: Highcharts.Axis): number {
    if (isNil(primaryAxis) || isNil(secondaryAxis)) {
        return ALIGNED;
    }

    const { tickPositions: primaryTickPositions = [] } = primaryAxis;
    const { tickPositions: secondaryTickPositions = [] } = secondaryAxis;

    const primaryZeroIndex = primaryTickPositions.indexOf(0);
    const secondaryZeroIndex = secondaryTickPositions.indexOf(0);

    // no need to align zero on axes without zero
    if (primaryZeroIndex < 0 || secondaryZeroIndex < 0) {
        return ALIGNED;
    }

    if (primaryZeroIndex > secondaryZeroIndex) {
        return MOVE_ZERO_RIGHT;
    }

    if (primaryZeroIndex < secondaryZeroIndex) {
        return MOVE_ZERO_LEFT;
    }

    return ALIGNED;
}

/**
 * Add new tick to first or last position
 * @param isAddFirst - if true, add to first. Otherwise, add to last
 */
function addTick(tickPositions: number[], tickInterval: number, isAddFirst: boolean): number[] {
    const tick: number = isAddFirst
        ? Highcharts.correctFloat(tickPositions[0] - tickInterval)
        : Highcharts.correctFloat(tickPositions[tickPositions.length - 1] + tickInterval);

    return isAddFirst ? [tick, ...tickPositions] : [...tickPositions, tick];
}

/**
 * Add or reduce ticks
 */
export function adjustTicks(axis: Highcharts.Axis): void {
    let tickPositions: number[] = (axis.tickPositions || []).slice();
    const { tickAmount, tickInterval } = axis as UnsafeInternals;
    const { dataMax, dataMin, min, max } = axis.getExtremes();
    const currentTickAmount: number = tickPositions.length;

    if (currentTickAmount === tickAmount) {
        return;
    }

    // add ticks to either start or end
    if (currentTickAmount < tickAmount) {
        while (tickPositions.length < tickAmount) {
            const isAddFirst =
                dataMax <= 0 || // negative dataSet
                max <= 0 ||
                !(
                    dataMin >= 0 || // positive dataSet
                    min >= 0 ||
                    min === 0 || // default HC behavior
                    tickPositions.length % 2 !== 0
                );

            tickPositions = addTick(tickPositions, tickInterval, isAddFirst);
        }
    } else {
        // reduce ticks
        const [start, end] = getSelectionRange(axis);
        tickPositions = tickPositions.slice(start, end);
    }

    axis.tickPositions = tickPositions.slice();
}

export function getSelectionRange(axis: Highcharts.Axis): number[] {
    const { tickAmount } = axis as UnsafeInternals;
    const { tickPositions } = axis;
    const { dataMin, dataMax } = axis.getExtremes();
    const currentTickAmount: number = tickPositions.length;
    if (dataMin >= 0) {
        return [currentTickAmount - tickAmount, currentTickAmount];
    }
    if (dataMax <= 0) {
        return [0, tickAmount];
    }

    const zeroIndex = tickPositions.indexOf(0);
    const firstTickToZero = Math.abs(0 - zeroIndex);
    const lastTickToZero = currentTickAmount - 1 - zeroIndex;

    // get range from furthest tick to zero
    if (firstTickToZero <= lastTickToZero) {
        return [0, tickAmount];
    }
    return [currentTickAmount - tickAmount, currentTickAmount];
}

/**
 * Get axis score that increase 1 for data having positive and negative values
 */
export function getYAxisScore(axis: Highcharts.Axis): number {
    const { dataMin, dataMax } = axis.getExtremes();
    const yAxisMin = Math.min(0, dataMin);
    const yAxisMax = Math.max(0, dataMax);

    if (yAxisMin < 0 && yAxisMax > 0) {
        return Y_AXIS_SCORE.NEGATIVE_AND_POSITIVE_DATA;
    }

    if (yAxisMin < 0 || yAxisMax > 0) {
        return Y_AXIS_SCORE.ONLY_NEGATIVE_OR_POSITIVE_DATA;
    }

    return Y_AXIS_SCORE.NO_DATA;
}

/**
 * Base on axis score which is bigger than another, will become base axis
 * The other axis will be aligned to base axis
 *
 * @returns base Y axis and aligned Y axis
 */
function getBaseYAxis(yAxes: Highcharts.Axis[]): IBaseAndAlignedAxes {
    const [firstAxisScore, secondAxisScore] = yAxes.map(getYAxisScore);
    if (firstAxisScore >= secondAxisScore) {
        return {
            baseYAxis: yAxes[0],
            alignedYAxis: yAxes[1],
        };
    }
    return {
        baseYAxis: yAxes[1],
        alignedYAxis: yAxes[0],
    };
}

export function alignToBaseAxis(yAxis: Highcharts.Axis, baseYAxis: Highcharts.Axis): void {
    const { tickInterval } = yAxis as UnsafeInternals;
    for (
        let direction: number = getDirection(baseYAxis, yAxis);
        direction !== ALIGNED;
        direction = getDirection(baseYAxis, yAxis)
    ) {
        let tickPositions: number[] = yAxis.tickPositions.slice();

        if (direction === MOVE_ZERO_RIGHT) {
            // add new tick to the start
            tickPositions = addTick(tickPositions, tickInterval, true);
            // remove last tick
            tickPositions = tickPositions.slice(0, tickPositions.length - 1);
        } else if (direction === MOVE_ZERO_LEFT) {
            // add new tick to the end
            tickPositions = addTick(tickPositions, tickInterval, false);
            // remove first tick
            tickPositions = tickPositions.slice(1, tickPositions.length);
        }

        yAxis.tickPositions = tickPositions;
    }
}

function updateAxis(axis: Highcharts.Axis, currentTickAmount: number): void {
    const { options, tickPositions } = axis;
    const { tickAmount } = axis as UnsafeInternals;

    (axis as UnsafeInternals).transA *= (currentTickAmount - 1) / (Math.max(tickAmount, 2) - 1); // avoid N/0 case

    axis.min = options.startOnTick ? tickPositions[0] : Math.min(axis.min, tickPositions[0]);

    axis.max = options.endOnTick
        ? tickPositions[tickPositions.length - 1]
        : Math.max(axis.max, tickPositions[tickPositions.length - 1]);
}

/**
 * Prevent data is cut off by increasing tick interval to zoom out axis
 * Only apply to chart without user-input min/max
 */
export function preventDataCutOff(axis: Highcharts.Axis): void {
    const { chart } = axis;
    const { min, max, dataMin, dataMax } = axis.getExtremes();

    const isCutOff = !isUserSetExtremesOnAnyAxis(chart) && (min > dataMin || max < dataMax);
    if (!isCutOff) {
        return;
    }

    (axis as UnsafeInternals).tickInterval *= 2;
    axis.tickPositions = axis.tickPositions.map((value: number): number => value * 2);
    updateAxis(axis, (axis as UnsafeInternals).tickAmount);
}

/**
 * Align axes once secondary axis is ready
 * Cause at the time HC finishes adjust primary axis, secondary axis has not been done yet
 */
function alignYAxes(axis: Highcharts.Axis): void {
    const chart: Highcharts.Chart = axis.chart;
    const yAxes = getYAxes(chart);
    const { baseYAxis, alignedYAxis } = getBaseYAxis(yAxes);
    const direction: number = getDirection(baseYAxis, alignedYAxis);
    const isReadyToAlign: boolean = (axis as UnsafeInternals).opposite && direction !== ALIGNED;
    const hasLineChart: boolean = isAxisWithLineChartType(baseYAxis) || isAxisWithLineChartType(alignedYAxis);

    if (baseYAxis && alignedYAxis && isReadyToAlign && !hasLineChart) {
        alignToBaseAxis(alignedYAxis, baseYAxis);
        updateAxis(alignedYAxis, (alignedYAxis as UnsafeInternals).tickAmount);
        preventDataCutOff(alignedYAxis);
    }
}

/**
 * Copy and modify Highcharts behavior
 */
export function customAdjustTickAmount(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const axis = this;
    if (!axis.hasData()) {
        return;
    }

    if (isYAxis(axis)) {
        // persist tick amount value to calculate transA in 'updateAxis'
        const currentTickAmount = (axis.tickPositions || []).length;
        adjustTicks(axis);
        updateAxis(axis, currentTickAmount);
        preventDataCutOff(axis);
    }

    // The finalTickAmt property is set in getTickAmount
    const { finalTickAmt } = axis;
    if (!isNil(finalTickAmt)) {
        const len = axis.tickPositions.length;
        let i = len;
        while (i--) {
            if (
                // Remove every other tick
                (finalTickAmt === 3 && i % 2 === 1) ||
                // Remove all but first and last
                (finalTickAmt <= 2 && i > 0 && i < len - 1)
            ) {
                axis.tickPositions.splice(i, 1);
            }
        }
        axis.finalTickAmt = undefined;
    }
}

function isAxisWithLineChartType(axis: Highcharts.Axis): boolean {
    if (isLineChart(axis?.chart?.userOptions?.chart?.type)) {
        return true;
    }

    const { series } = axis;
    return series.reduce((result: boolean, item: Highcharts.Series) => {
        return isLineChart(item.type) ? true : result;
    }, false);
}

function isSingleAxisChart(axis: Highcharts.Axis): boolean {
    const yAxes = getYAxes(axis.chart);
    return yAxes.length < 2;
}

/**
 * Decide whether run default or custom behavior
 *
 * @returns true as leaving to HC, otherwise false as running custom behavior
 */
export function shouldBeHandledByHighcharts(axis: Highcharts.Axis): boolean {
    if (!isYAxis(axis) || isSingleAxisChart(axis) || isAxisWithLineChartType(axis)) {
        return true;
    }

    const yAxes = getYAxes(axis.chart);
    return yAxes.some((axis: UnsafeInternals) => axis.visible === false);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const adjustTickAmount = (HighchartsInstance: any): void => {
    Highcharts.wrap(
        HighchartsInstance.Axis.prototype,
        "adjustTickAmount",
        function (proceed: Highcharts.WrapProceedFunction) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const axis = this;

            if (shouldBeHandledByHighcharts(axis)) {
                proceed.call(axis);
            } else {
                customAdjustTickAmount.call(axis);
            }

            if (!isSingleAxisChart(axis)) {
                alignYAxes(axis);
            }
        },
    );
};
