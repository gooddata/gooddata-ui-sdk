// (C) 2007-2018 GoodData Corporation
import flatten = require('lodash/flatten');
import get = require('lodash/get');
import map = require('lodash/map');
import zip = require('lodash/zip');
import unzip = require('lodash/unzip');
import initial = require('lodash/initial');
import tail = require('lodash/tail');
import isEmpty = require('lodash/isEmpty');
import maxBy = require('lodash/maxBy');
import minBy = require('lodash/minBy');
import min = require('lodash/min');
import max = require('lodash/max');
import isNil = require('lodash/isNil');

import { ISeriesItem, ISeriesDataItem } from '../chartOptionsBuilder';
import { VisualizationTypes, VisType } from '../../../../constants/visualizationTypes';
import { IChartConfig } from '../Chart';
import { isBarChart } from '../../utils/common';

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
    r1.x < (r2.x + r2.width) &&
    (r1.x + r1.width) > r2.x &&
    r1.y < (r2.y + r2.height) &&
    (r1.y + r1.height) > r2.y;

export const toNeighbors = (array: any) => zip(initial(array), tail(array));
export const getVisibleSeries = (chart: any) => chart.series && chart.series.filter((s: any) => s.visible);
export const getHiddenSeries = (chart: any) => chart.series && chart.series.filter((s: any) => !s.visible);
export const getDataPoints = (series: ISeriesItem[]) => flatten(unzip(map(series, (s: any) => s.points)));
export const getDataPointsOfVisibleSeries = (chart: any) => getDataPoints(getVisibleSeries(chart));
export const getChartType = (chart: any) => get(chart, 'options.chart.type');
export const isStacked = (chart: any) => {
    const chartType = getChartType(chart);
    if (get(chart, `userOptions.plotOptions.${chartType}.stacking`, false) &&
        chart.axes.some((axis: any) => !isEmpty(axis.stacks))) {
        return true;
    }

    if (get(chart, 'userOptions.plotOptions.series.stacking', false) &&
        chart.axes.some((axis: any) => !isEmpty(axis.stacks))) {
        return true;
    }

    return false;
};

export function getChartProperties(config: IChartConfig, type: VisType) {
    return {
        xAxisProps: isBarChart(type) ? { ...config.yaxis } : { ...config.xaxis },
        yAxisProps: isBarChart(type) ? { ...config.xaxis } : { ...config.yaxis }
    };
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
        hide: () => dataLabel.hide()
    };
};

export function getShapeAttributes(point: any): IRectBySize {
    const { series, shapeArgs } = point;
    const { plotSizeX, plotSizeY, options } = series.chart;

    if (options.chart.type === VisualizationTypes.BAR) {
        return {
            x: Math.floor(plotSizeY - (shapeArgs.y - series.group.translateX) - shapeArgs.height),
            y: Math.ceil((plotSizeX + series.group.translateY) - shapeArgs.x - shapeArgs.width),
            width: shapeArgs.height,
            height: shapeArgs.width
        };
    } else if (options.chart.type === VisualizationTypes.COLUMN) {
        return {
            x: shapeArgs.x + series.group.translateX,
            y: shapeArgs.y + series.group.translateY,
            width: shapeArgs.width,
            height: shapeArgs.height
        };
    }

    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
}

export function shouldFollowPointer(chartOptions: any) {
    const yMax = parseFloat(get(chartOptions, 'yAxisProps.max', ''));
    const yMin = parseFloat(get(chartOptions, 'yAxisProps.min', ''));

    if (isNaN(yMax) && isNaN(yMin)) {
        return false;
    }

    const { minDataValue, maxDataValue } = getDataExtremeDataValues(chartOptions);

    return (!isNaN(yMax) && maxDataValue > yMax) || (!isNaN(yMin) && minDataValue < yMin);
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
    const series = get<ISeriesItem[]>(chartOptions, 'data.series');

    const maxDataValue = chartOptions.hasStackByAttribute
        ? getStackedMaxValue(series)
        : getNonStackedMaxValue(series);

    const minDataValue = chartOptions.hasStackByAttribute
        ? getStackedMinValue(series)
        : getNonStackedMinValue(series);

    return { minDataValue, maxDataValue };
}

function getSerieMaxDataValue(serieData: ISeriesDataItem[]): number {
    const max = maxBy(serieData, (item: ISeriesDataItem) => item && item.y ? item.y : null);
    return max ? max.y : Number.MIN_SAFE_INTEGER;
}

function getSerieMinDataValue(serieData: ISeriesDataItem[]): number {
    const min = minBy(serieData, (item: ISeriesDataItem) => item && item.y ? item.y : null);
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

function getColumnExtremeValue(series: ISeriesItem[], extremeColumnGetter: (data: number[]) => number): number[] {
    const seriesDataPerColumn = zip(...series
        .filter(isSerieVisible)
        .map(serie => serie.data));

    const seriesDataYValue = seriesDataPerColumn.map(data => data.map(x => x.y));
    return seriesDataYValue.map(extremeColumnGetter);
}

function getMaxFromPositiveNegativeStacks(data: number[]): number {
    return data.reduce((acc: number, current: number) => {
        if (isNil(current)) {
            return acc;
        }

        if ((current < 0) || (acc < 0)) {
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

        if ((current > 0) || (acc > 0)) {
            return Math.min(acc, current);
        }

        return acc + current;
    }, Number.MAX_SAFE_INTEGER);
}

export function shouldStartOnTick(chartOptions: any): boolean {
    const min = parseFloat(get(chartOptions, 'yAxisProps.min', ''));
    const max = parseFloat(get(chartOptions, 'yAxisProps.max', ''));

    if ((isNaN(min) && isNaN(max))) {
        return true;
    }

    if ((!isNaN(min) && !isNaN(max))) {
        return min > max;
    }

    const series = get<ISeriesItem[]>(chartOptions, 'data.series');
    const minDataValue = chartOptions.hasStackByAttribute
        ? getStackedMinValue(series)
        : getNonStackedMinValue(series);

    const hasIncorrectMax = !isNaN(max) && max <= minDataValue;
    if (hasIncorrectMax) {
        return true;
    }

    return false;
}
export function shouldEndOnTick(chartOptions: any): boolean {
    const min = parseFloat(get(chartOptions, 'yAxisProps.min', ''));
    const max = parseFloat(get(chartOptions, 'yAxisProps.max', ''));

    if ((isNaN(min) && isNaN(max))) {
        return true;
    }

    if ((!isNaN(min) && !isNaN(max))) {
        return min > max;
    }

    const series = get<ISeriesItem[]>(chartOptions, 'data.series');
    const maxDataValue = chartOptions.hasStackByAttribute
        ? getStackedMaxValue(series)
        : getNonStackedMaxValue(series);

    const hasIncorrectMin = !isNaN(min) && min >= maxDataValue;
    if (hasIncorrectMin) {
        return true;
    }

    return false;
}

export interface IAxisRange {
    minAxisValue: number;
    maxAxisValue: number;
}

export function getAxisRange(chart: any, axisName = 'yAxis'): IAxisRange {
    return {
        minAxisValue: get(chart, [axisName, 0, 'min'], 0),
        maxAxisValue: get(chart, [axisName, 0, 'max'], 0)
    };
}

export function pointInRange(pointValue: number, axisRange: IAxisRange): boolean {
    return axisRange.minAxisValue <= pointValue && pointValue <= axisRange.maxAxisValue;
}
