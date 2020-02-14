// (C) 2007-2019 GoodData Corporation
import flatten = require("lodash/flatten");
import get = require("lodash/get");
import pick = require("lodash/pick");
import map = require("lodash/map");
import zip = require("lodash/zip");
import unzip = require("lodash/unzip");
import initial = require("lodash/initial");
import tail = require("lodash/tail");
import isEmpty = require("lodash/isEmpty");
import maxBy = require("lodash/maxBy");
import minBy = require("lodash/minBy");
import min = require("lodash/min");
import max = require("lodash/max");
import isNil = require("lodash/isNil");

import { VisualizationTypes, VisType } from "@gooddata/sdk-ui";
import { isBarChart } from "../../utils/common";
import { ISeriesItem, ISeriesDataItem, IChartConfig, ChartAlignTypes } from "../../Config";
import { BOTTOM, MIDDLE, TOP } from "../../constants/alignments";

export interface IRectByPoints {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface IRectBySize {
    x: number;
    y: number;
    width: number;
    height: number;
    show?: () => {};
    hide?: () => {};
}

// https://silentmatt.com/rectangle-intersection/
export const rectanglesAreOverlapping = (r1: IRectByPoints, r2: IRectByPoints, padding: number = 0) =>
    r1.left - padding < r2.right + padding &&
    r1.right + padding > r2.left - padding &&
    r1.top - padding < r2.bottom + padding &&
    r1.bottom + padding > r2.top - padding;

export const isIntersecting = (r1: IRectBySize, r2: IRectBySize) =>
    r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;

export const toNeighbors = (array: any) => zip(initial(array), tail(array));
export const getVisibleSeries = (chart: any) => chart.series && chart.series.filter((s: any) => s.visible);
export const getHiddenSeries = (chart: any) => chart.series && chart.series.filter((s: any) => !s.visible);
export const getDataPoints = (series: ISeriesItem[]) => flatten(unzip(map(series, (s: any) => s.points)));
export const getDataPointsOfVisibleSeries = (chart: any) => getDataPoints(getVisibleSeries(chart));

export const getChartType = (chart: any): string => get(chart, "options.chart.type");
export const isStacked = (chart: any) => {
    const chartType = getChartType(chart);
    if (
        get(chart, `userOptions.plotOptions.${chartType}.stacking`, false) &&
        chart.axes.some((axis: any) => !isEmpty(axis.stacks))
    ) {
        return true;
    }

    if (
        get(chart, "userOptions.plotOptions.series.stacking", false) &&
        chart.axes.some((axis: any) => !isEmpty(axis.stacks))
    ) {
        return true;
    }

    return false;
};

export function getChartProperties(config: IChartConfig, type: VisType) {
    const isBarType = isBarChart(type);
    const chartProps: any = {
        xAxisProps: isBarType ? { ...config.yaxis } : { ...config.xaxis },
        yAxisProps: isBarType ? { ...config.xaxis } : { ...config.yaxis },
    };

    const secondaryXAxisProps = isBarType ? { ...config.secondary_yaxis } : { ...config.secondary_xaxis };
    const secondaryYAxisProps = isBarType ? { ...config.secondary_xaxis } : { ...config.secondary_yaxis };

    if (!isEmpty(secondaryXAxisProps)) {
        chartProps.secondary_xAxisProps = secondaryXAxisProps;
    }
    if (!isEmpty(secondaryYAxisProps)) {
        chartProps.secondary_yAxisProps = secondaryYAxisProps;
    }

    return chartProps;
}

export const getPointPositions = (point: any) => {
    const { dataLabel, graphic } = point;
    const labelRect = dataLabel.element.getBoundingClientRect();
    const shapeRect = graphic.element.getBoundingClientRect();
    return {
        shape: shapeRect,
        label: labelRect,
        labelPadding: dataLabel.padding,
        show: () => dataLabel.show(),
        hide: () => dataLabel.hide(),
    };
};

export function getShapeAttributes(point: any): IRectBySize {
    const { series, shapeArgs } = point;
    const { plotSizeX, plotSizeY, options } = series.chart;

    if (options.chart.type === VisualizationTypes.BAR) {
        return {
            x: Math.floor(plotSizeY - (shapeArgs.y - series.group.translateX) - shapeArgs.height),
            y: Math.ceil(plotSizeX + series.group.translateY - shapeArgs.x - shapeArgs.width),
            width: shapeArgs.height,
            height: shapeArgs.width,
        };
    } else if (options.chart.type === VisualizationTypes.COLUMN) {
        return {
            x: shapeArgs.x + series.group.translateX,
            y: shapeArgs.y + series.group.translateY,
            width: shapeArgs.width,
            height: shapeArgs.height,
        };
    }

    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };
}

function getExtremeOnAxis(min: number, max: number) {
    const axisMin = min >= 0 ? 0 : min;
    const axisMax = max < 0 ? 0 : max;

    return { axisMin, axisMax };
}

export function shouldFollowPointerForDualAxes(chartOptions: any) {
    const yAxes = get(chartOptions, "yAxes", []);
    if (yAxes.length <= 1) {
        return false;
    }

    const hasMinMaxValue = [
        "yAxisProps.min",
        "yAxisProps.max",
        "secondary_yAxisProps.min",
        "secondary_yAxisProps.max",
    ].reduce((result, key: string) => {
        const value = get(chartOptions, key, undefined);
        return isEmpty(value) ? result : value;
    }, undefined);
    return yAxes.length > 1 && hasMinMaxValue;
}

function isMinMaxLimitData(chartOptions: any, key: string) {
    const yMin = parseFloat(get(chartOptions, `${key}.min`, ""));
    const yMax = parseFloat(get(chartOptions, `${key}.max`, ""));
    if (isNaN(yMin) && isNaN(yMax)) {
        return false;
    }

    const { minDataValue, maxDataValue } = getDataExtremeDataValues(chartOptions);
    const { axisMin, axisMax } = getExtremeOnAxis(minDataValue, maxDataValue);

    return (!isNaN(yMax) && axisMax > yMax) || (!isNaN(yMin) && axisMin < yMin);
}

export function shouldFollowPointer(chartOptions: any) {
    if (shouldFollowPointerForDualAxes(chartOptions)) {
        return true;
    }
    return (
        isMinMaxLimitData(chartOptions, "yAxisProps") ||
        isMinMaxLimitData(chartOptions, "secondary_yAxisProps")
    );
}

function isSerieVisible(serie: ISeriesItem): boolean {
    return serie.visible === undefined || serie.visible;
}

function getNonStackedMaxValue(series: ISeriesItem[]): number {
    return series.reduce((maxValue: number, serie: ISeriesItem) => {
        if (isSerieVisible(serie)) {
            const maxSerieValue = getSerieMaxDataValue(serie.data);

            return maxValue > maxSerieValue ? maxValue : maxSerieValue;
        }
        return maxValue;
    }, Number.MIN_SAFE_INTEGER);
}

function getNonStackedMinValue(series: ISeriesItem[]): number {
    return series.reduce((minValue: number, serie: ISeriesItem) => {
        if (isSerieVisible(serie)) {
            const minSerieValue = getSerieMinDataValue(serie.data);

            return minValue < minSerieValue ? minValue : minSerieValue;
        }
        return minValue;
    }, Number.MAX_SAFE_INTEGER);
}

function getDataExtremeDataValues(chartOptions: any) {
    const series = get(chartOptions, "data.series");

    const maxDataValue = chartOptions.hasStackByAttribute
        ? getStackedMaxValue(series)
        : getNonStackedMaxValue(series);

    const minDataValue = chartOptions.hasStackByAttribute
        ? getStackedMinValue(series)
        : getNonStackedMinValue(series);

    return { minDataValue, maxDataValue };
}

function getSerieMaxDataValue(serieData: ISeriesDataItem[]): number {
    const max = maxBy(serieData, (item: ISeriesDataItem) => (item && item.y ? item.y : null));
    return max ? max.y : Number.MIN_SAFE_INTEGER;
}

function getSerieMinDataValue(serieData: ISeriesDataItem[]): number {
    const min = minBy(serieData, (item: ISeriesDataItem) => (item && item.y ? item.y : null));
    return min ? min.y : Number.MAX_SAFE_INTEGER;
}

export function getStackedMaxValue(series: ISeriesItem[]) {
    const maximumPerColumn = getColumnExtremeValue(series, getMaxFromPositiveNegativeStacks);

    const maxValue = max(maximumPerColumn);
    return !isNil(maxValue) ? maxValue : Number.MIN_SAFE_INTEGER;
}

export function getStackedMinValue(series: ISeriesItem[]) {
    const minimumPerColumn = getColumnExtremeValue(series, getMinFromPositiveNegativeStacks);

    const minValue = min(minimumPerColumn);
    return !isNil(minValue) ? minValue : Number.MAX_SAFE_INTEGER;
}

function getColumnExtremeValue(
    series: ISeriesItem[],
    extremeColumnGetter: (data: number[]) => number,
): number[] {
    const seriesDataPerColumn = zip(...series.filter(isSerieVisible).map(serie => serie.data));

    const seriesDataYValue = seriesDataPerColumn.map(data => data.map(x => x.y));
    return seriesDataYValue.map(extremeColumnGetter);
}

function getMaxFromPositiveNegativeStacks(data: number[]): number {
    return data.reduce((acc: number, current: number) => {
        if (isNil(current)) {
            return acc;
        }

        if (current < 0 || acc < 0) {
            return Math.max(acc, current);
        }

        return acc + current;
    }, Number.MIN_SAFE_INTEGER);
}

function getMinFromPositiveNegativeStacks(data: number[]): number {
    return data.reduce((acc: number, current: number) => {
        if (isNil(current)) {
            return acc;
        }

        if (current > 0 || acc > 0) {
            return Math.min(acc, current);
        }

        return acc + current;
    }, Number.MAX_SAFE_INTEGER);
}

export function shouldStartOnTick(chartOptions: any, axisPropsKey = "yAxisProps"): boolean {
    const min = parseFloat(get(chartOptions, `${axisPropsKey}.min`, ""));
    const max = parseFloat(get(chartOptions, `${axisPropsKey}.max`, ""));

    if (isNaN(min) && isNaN(max)) {
        return true;
    }

    if (!isNaN(min) && !isNaN(max)) {
        return min > max;
    }

    const series = get(chartOptions, "data.series");
    const minDataValue = chartOptions.hasStackByAttribute
        ? getStackedMinValue(series)
        : getNonStackedMinValue(series);

    const hasIncorrectMax = !isNaN(max) && max <= minDataValue;
    if (hasIncorrectMax) {
        return true;
    }

    return false;
}
export function shouldEndOnTick(chartOptions: any, axisPropsKey = "yAxisProps"): boolean {
    const min = parseFloat(get(chartOptions, `${axisPropsKey}.min`, ""));
    const max = parseFloat(get(chartOptions, `${axisPropsKey}.max`, ""));

    if (isNaN(min) && isNaN(max)) {
        return true;
    }

    if (!isNaN(min) && !isNaN(max)) {
        return min > max;
    }

    const series = get(chartOptions, "data.series");
    const maxDataValue = chartOptions.hasStackByAttribute
        ? getStackedMaxValue(series)
        : getNonStackedMaxValue(series);

    const hasIncorrectMin = !isNaN(min) && min >= maxDataValue;
    if (hasIncorrectMin) {
        return true;
    }

    return false;
}

export function shouldXAxisStartOnTickOnBubbleScatter(chartOptions: any) {
    const min = parseFloat(get(chartOptions, "xAxisProps.min", ""));

    return isNaN(min) ? true : false;
}

export function shouldYAxisStartOnTickOnBubbleScatter(chartOptions: any) {
    const min = parseFloat(get(chartOptions, "yAxisProps.min", ""));

    const series = get(chartOptions, "data.series");
    const maxDataValue = getNonStackedMaxValue(series);

    return isNaN(min) || min > maxDataValue ? true : false;
}

export interface IAxisRange {
    minAxisValue: number;
    maxAxisValue: number;
}

export interface IAxisRangeForAxes {
    first?: IAxisRange;
    second?: IAxisRange;
}

export function getAxisRangeForAxes(chart: any): IAxisRangeForAxes {
    const yAxis: any = get(chart, "yAxis", []);
    return yAxis
        .map((axis: any) => pick(axis, ["opposite", "min", "max"]))
        .map(({ opposite, min, max }: any) => ({ axis: opposite ? "second" : "first", min, max }))
        .reduce((result: IAxisRangeForAxes, { axis, min, max }: any) => {
            result[axis] = {
                minAxisValue: min,
                maxAxisValue: max,
            };
            return result;
        }, {});
}

export function pointInRange(pointValue: number, axisRange: IAxisRange): boolean {
    return axisRange.minAxisValue <= pointValue && pointValue <= axisRange.maxAxisValue;
}

export function alignChart(chart: Highcharts.Chart) {
    const { container } = chart;
    if (!container) {
        return;
    }

    const { width: chartWidth, height: chartHeight } = container.getBoundingClientRect();
    const margin: number = chartHeight - chartWidth;

    const isVerticalRectContainer: boolean = margin > 0;
    const verticalAlign: ChartAlignTypes = get(chart, "userOptions.chart.verticalAlign", MIDDLE);

    const isAlignedToTop = verticalAlign === TOP;
    const isAlignedToBottom = verticalAlign === BOTTOM;

    const type = getChartType(chart);
    const className = `s-highcharts-${type}-aligned-to-${verticalAlign}`;

    let chartOptions: Highcharts.ChartOptions = {};
    if (isVerticalRectContainer && verticalAlign !== MIDDLE) {
        chartOptions = {
            spacingTop: isAlignedToTop ? 0 : undefined,
            spacingBottom: isAlignedToBottom ? 0 : undefined,
            marginTop: isAlignedToBottom ? margin : undefined,
            marginBottom: isAlignedToTop ? margin : undefined,
            className,
        };
    } else {
        chartOptions = {
            spacingTop: undefined,
            spacingBottom: undefined,
            marginTop: undefined,
            marginBottom: undefined,
            className,
        };
    }

    chart.update(
        {
            chart: chartOptions,
        },
        false,
        false,
        false,
    );
}
