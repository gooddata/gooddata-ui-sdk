// tslint:disable-line
/**
 * Highcharts extension that overwrites 'axis.adjustTickAmount' of Highcharts
 * Original code snippet
 *      https://github.com/highcharts/highcharts/blob/b54fe33d91c0d1fd7da009aaa84af694f15cffad/js/parts/Axis.js#L4214
 *
 * Modified by binh.nguyen@gooddata.com to support zero alignment
 */

import isNil = require("lodash/isNil");
import get = require("lodash/get");
import { correctFloat, wrap, WrapProceedFunction } from "highcharts";
import { IHighchartsAxisExtend } from "../../../../../interfaces/HighchartsExtend";
import { isLineChart, isPrimaryYAxis } from "../../../utils/common";

const ALIGNED = 0;
const MOVE_ZERO_LEFT = -1;
const MOVE_ZERO_RIGHT = 1;

function getYAxes(chart: Highcharts.Chart): IHighchartsAxisExtend[] {
    return chart.axes.filter(isYAxis);
}

function isYAxis(axis: IHighchartsAxisExtend): boolean {
    return axis.coll === "yAxis";
}

/**
 * Check if user sets min/max on any axis
 * @param chart
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
function getDirection(primaryAxis: IHighchartsAxisExtend, secondaryAxis: IHighchartsAxisExtend): number {
    const { tickPositions: primaryTickPosition } = primaryAxis;
    const { tickPositions: secondaryTickPosition } = secondaryAxis;

    const primaryZeroIndex = primaryTickPosition.indexOf(0);
    const secondaryZeroIndex = secondaryTickPosition.indexOf(0);

    // no need to align zero on axes without zero or aligned already
    if (
        isNil(primaryZeroIndex) ||
        isNil(secondaryZeroIndex) ||
        primaryZeroIndex < 0 ||
        secondaryZeroIndex < 0 ||
        primaryZeroIndex === secondaryZeroIndex
    ) {
        return ALIGNED;
    }

    if (primaryZeroIndex > secondaryZeroIndex) {
        return MOVE_ZERO_RIGHT;
    }

    return MOVE_ZERO_LEFT;
}

/**
 * Add new tick to first or last position
 * @param tickPositions
 * @param tickInterval
 * @param isAddFirst: if true, add to first. Otherwise, add to last
 */
function addTick(tickPositions: number[], tickInterval: number, isAddFirst: boolean): number[] {
    const tick: number = isAddFirst
        ? correctFloat(tickPositions[0] - tickInterval)
        : correctFloat(tickPositions[tickPositions.length - 1] + tickInterval);

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
        tickPositions =
            axis.dataMin >= 0
                ? tickPositions.slice(currentTickAmount - tickAmount)
                : tickPositions.slice(0, tickAmount);
    }

    axis.tickPositions = tickPositions.slice();
}

/**
 * Align zero of secondary axis to primary axis
 * @param axis
 */
export function alignSecondaryAxis(axis: IHighchartsAxisExtend): void {
    if (isPrimaryYAxis(axis)) {
        // only handle on secondary axis
        return;
    }

    const {
        chart: { axes },
    } = axis;
    const primaryAxis: IHighchartsAxisExtend = axes.find(
        (axis: IHighchartsAxisExtend) => isYAxis(axis) && isPrimaryYAxis(axis),
    );
    if (!primaryAxis) {
        return;
    }

    const { tickInterval } = axis;
    for (
        let direction: number = getDirection(primaryAxis, axis);
        direction !== ALIGNED;
        direction = getDirection(primaryAxis, axis)
    ) {
        let tickPositions: number[] = axis.tickPositions.slice();

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

        axis.tickPositions = tickPositions;
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
 * Prevent data is cut off by increasing tick interval to zoom out secondary axis
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
    axis.setTickPositions();
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
        alignSecondaryAxis(axis);
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

/**
 * Decide whether run default or custom behavior
 * @param axis
 */
export function shouldBeHandledByHighcharts(axis: IHighchartsAxisExtend): boolean {
    if (!isYAxis(axis)) {
        return true;
    }

    const chart = axis.chart;
    const yAxes = getYAxes(chart);
    const isSingleAxis = yAxes.length < 2;
    if (isSingleAxis) {
        return true;
    }

    if (isAxisWithLineChartType(axis)) {
        return true;
    }

    return yAxes.some((axis: IHighchartsAxisExtend) => axis.visible === false);
}

export const adjustTickAmount = (HighCharts: any) => {
    wrap(HighCharts.Axis.prototype, "adjustTickAmount", function(proceed: WrapProceedFunction) {
        const axis = this;

        if (shouldBeHandledByHighcharts(axis)) {
            return proceed.call(axis);
        }

        return customAdjustTickAmount.call(axis);
    });
};
