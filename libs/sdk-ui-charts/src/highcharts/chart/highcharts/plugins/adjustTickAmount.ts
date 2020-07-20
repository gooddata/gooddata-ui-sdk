// (C) 2020 GoodData Corporation
// tslint:disable-line
/**
 * Highcharts extension that overwrites 'axis.adjustTickAmount' of Highcharts
 * Original code snippet
 *      https://github.com/highcharts/highcharts/blob/b54fe33d91c0d1fd7da009aaa84af694f15cffad/js/parts/Axis.js#L4214
 *
 * Modified by binh.nguyen@gooddata.com to support zero alignment
 */

import isNil from "lodash/isNil";
import get from "lodash/get";
import Highcharts from "../highchartsEntryPoint";
import { IHighchartsAxisExtend } from "../../../typings/extend";
import { isLineChart } from "../../../utils/common";

interface IBaseAndAlignedAxes {
    baseYAxis: IHighchartsAxisExtend;
    alignedYAxis: IHighchartsAxisExtend;
}

export const ALIGNED = 0;
export const MOVE_ZERO_LEFT = -1;
export const MOVE_ZERO_RIGHT = 1;

export const Y_AXIS_SCORE = {
    NO_DATA: 0,
    ONLY_NEGATIVE_OR_POSITIVE_DATA: 1,
    NEGATIVE_AND_POSITIVE_DATA: 2,
};

function getYAxes(chart: Highcharts.Chart): IHighchartsAxisExtend[] {
    return chart.axes.filter(isYAxis);
}

function isYAxis(axis: IHighchartsAxisExtend): boolean {
    return axis.coll === "yAxis";
}

/**
 * Check if user sets min/max on any axis
 * @param chart
 * @return true if any axis is set min/max to. Otherwise false
 */
function isUserSetExtremesOnAnyAxis(chart: Highcharts.Chart): boolean {
    const yAxes = chart.userOptions.yAxis;
    return yAxes[0].isUserMinMax || yAxes[1].isUserMinMax;
}

/**
 * Get direction to make secondary axis align to primary axis
 * @param primaryAxis
 * @param secondaryAxis
 * @return
 *     -1: move zero index to left
 *      0: it aligns
 *      1: move zero index to right
 */
export function getDirection(
    primaryAxis: IHighchartsAxisExtend,
    secondaryAxis: IHighchartsAxisExtend,
): number {
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
 * @param tickPositions
 * @param tickInterval
 * @param isAddFirst: if true, add to first. Otherwise, add to last
 */
function addTick(tickPositions: number[], tickInterval: number, isAddFirst: boolean): number[] {
    const tick: number = isAddFirst
        ? Highcharts.correctFloat(tickPositions[0] - tickInterval)
        : Highcharts.correctFloat(tickPositions[tickPositions.length - 1] + tickInterval);

    return isAddFirst ? [tick, ...tickPositions] : [...tickPositions, tick];
}

/**
 * Add or reduce ticks
 * @param axis
 */
export function adjustTicks(axis: IHighchartsAxisExtend): void {
    let tickPositions: number[] = (axis.tickPositions || []).slice();
    const tickAmount: number = axis.tickAmount;
    const currentTickAmount: number = tickPositions.length;

    if (currentTickAmount === tickAmount) {
        return;
    }

    // add ticks to either start or end
    if (currentTickAmount < tickAmount) {
        const min = axis.min;
        const tickInterval = axis.tickInterval;

        while (tickPositions.length < tickAmount) {
            const isAddFirst =
                axis.dataMax <= 0 || // negative dataSet
                axis.max <= 0 ||
                !(
                    axis.dataMin >= 0 || // positive dataSet
                    axis.min >= 0 ||
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

export function getSelectionRange(axis: IHighchartsAxisExtend): number[] {
    const { tickAmount, tickPositions, dataMin, dataMax } = axis;
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
 * @param Y axis
 * @return Y axis score
 */
export function getYAxisScore(axis: IHighchartsAxisExtend): number {
    const { dataMin, dataMax } = axis;
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
 * @param yAxes
 * @return base Y axis and aligned Y axis
 */
function getBaseYAxis(yAxes: IHighchartsAxisExtend[]): IBaseAndAlignedAxes {
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

export function alignToBaseAxis(yAxis: IHighchartsAxisExtend, baseYAxis: IHighchartsAxisExtend): void {
    const { tickInterval } = yAxis;
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

function updateAxis(axis: IHighchartsAxisExtend, currentTickAmount: number): void {
    const { options, tickPositions } = axis;

    axis.transA *= (currentTickAmount - 1) / (Math.max(axis.tickAmount, 2) - 1); // avoid N/0 case

    axis.min = options.startOnTick ? tickPositions[0] : Math.min(axis.min, tickPositions[0]);

    axis.max = options.endOnTick
        ? tickPositions[tickPositions.length - 1]
        : Math.max(axis.max, tickPositions[tickPositions.length - 1]);
}

/**
 * Prevent data is cut off by increasing tick interval to zoom out axis
 * Only apply to chart without user-input min/max
 * @param axis
 */
export function preventDataCutOff(axis: IHighchartsAxisExtend): void {
    const { chart } = axis;
    const { min, max, dataMin, dataMax } = axis;

    const isCutOff = !isUserSetExtremesOnAnyAxis(chart) && (min > dataMin || max < dataMax);
    if (!isCutOff) {
        return;
    }

    axis.tickInterval *= 2;
    axis.tickPositions = axis.tickPositions.map((value: number): number => value * 2);
    updateAxis(axis, axis.tickAmount);
}

/**
 * Align axes once secondary axis is ready
 * Cause at the time HC finishes adjust primary axis, secondary axis has not been done yet
 * @param axis
 */
function alignYAxes(axis: IHighchartsAxisExtend): void {
    const chart: Highcharts.Chart = axis.chart;
    const yAxes = getYAxes(chart);
    const { baseYAxis, alignedYAxis } = getBaseYAxis(yAxes);
    const direction: number = getDirection(baseYAxis, alignedYAxis);
    const isReadyToAlign: boolean = axis.opposite && direction !== ALIGNED;
    const hasLineChart: boolean = isAxisWithLineChartType(baseYAxis) || isAxisWithLineChartType(alignedYAxis);

    if (baseYAxis && alignedYAxis && isReadyToAlign && !hasLineChart) {
        alignToBaseAxis(alignedYAxis, baseYAxis);
        updateAxis(alignedYAxis, alignedYAxis.tickAmount);
        preventDataCutOff(alignedYAxis);
    }
}

/**
 * Copy and modify Highcharts behavior
 */
export function customAdjustTickAmount(): void {
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

function isAxisWithLineChartType(axis: IHighchartsAxisExtend): boolean {
    if (isLineChart(get(axis, "chart.userOptions.chart.type"))) {
        return true;
    }

    const { series } = axis;
    return series.reduce((result: boolean, item: Highcharts.Series) => {
        return isLineChart(item.type) ? true : result;
    }, false);
}

function isSingleAxisChart(axis: IHighchartsAxisExtend): boolean {
    const yAxes = getYAxes(axis.chart);
    return yAxes.length < 2;
}

/**
 * Decide whether run default or custom behavior
 * @param axis
 * @return true as leaving to HC, otherwise false as running custom behavior
 */
export function shouldBeHandledByHighcharts(axis: IHighchartsAxisExtend): boolean {
    if (!isYAxis(axis) || isSingleAxisChart(axis) || isAxisWithLineChartType(axis)) {
        return true;
    }

    const yAxes = getYAxes(axis.chart);
    return yAxes.some((axis: IHighchartsAxisExtend) => axis.visible === false);
}

export const adjustTickAmount = (HighchartsInstance: any) => {
    Highcharts.wrap(HighchartsInstance.Axis.prototype, "adjustTickAmount", function (
        proceed: Highcharts.WrapProceedFunction,
    ) {
        const axis = this;

        if (shouldBeHandledByHighcharts(axis)) {
            proceed.call(axis);
        } else {
            customAdjustTickAmount.call(axis);
        }

        if (!isSingleAxisChart(axis)) {
            alignYAxes(axis);
        }
    });
};
