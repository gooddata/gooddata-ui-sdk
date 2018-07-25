// (C) 2007-2018 GoodData Corporation
import flatten = require('lodash/flatten');
import flatMap = require('lodash/flatMap');
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
import sum = require('lodash/sum');

import { ISeriesItem, ISeriesDataItem } from '../chartOptionsBuilder';
import { VisualizationTypes, VisType } from '../../../../constants/visualizationTypes';
import { IChartConfig } from '../Chart';
import { isBarChart } from '../../utils/common';

// https://silentmatt.com/rectangle-intersection/
export const rectanglesAreOverlapping = (r1: any, r2: any, padding: any = 0) =>
    r1.left - padding < r2.right + padding &&
    r1.right + padding > r2.left - padding &&
    r1.top - padding < r2.bottom + padding &&
    r1.bottom + padding > r2.top - padding;

export const isIntersecting = (o1: any, o2: any) =>
    o1.x < (o2.x + o2.width) &&
    (o1.x + o1.width) > o2.x &&
    o1.y < (o2.y + o2.height) &&
    (o1.y + o1.height) > o2.y;

export function isLabelOverlappingItsShape(point: any) {
    const { dataLabel, shapeArgs } = point;
    if (dataLabel && shapeArgs) { // shapeArgs for point hidden by legend is undefined
        return dataLabel.width > shapeArgs.width || dataLabel.height > shapeArgs.height;
    }
    return false;
}

export const toNeighbors = (array: any) => zip(initial(array), tail(array));
export const getVisibleSeries = (chart: any) => chart.series && chart.series.filter((s: any) => s.visible);
export const getHiddenSeries = (chart: any) => chart.series && chart.series.filter((s: any) => !s.visible);
export const getDataPoints = (series: any) => flatten(unzip(map(series, (s: any) => s.points)));
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
export const areLabelsStacked = (chart: any) =>
    (get(chart, 'userOptions.yAxis.0.stackLabels.enabled', false) && isStacked(chart));

export const hasDataLabel = (point: any) => point.dataLabel;

export const hideDataLabel = (point: any) => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.hide();
    }
};

export const showDataLabel = (point: any) => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.show();
    }
};

export const hideDataLabels = (points: any) => {
    points.filter(hasDataLabel).forEach(hideDataLabel);
};

export const showDataLabels = (points: any) => {
    points.filter(hasDataLabel).forEach(showDataLabel);
};

export const showDataLabelInAxisRange = (point: any, minAxisValue: number) => {
    const { dataLabel } = point;
    if (dataLabel && (point.y < minAxisValue)) {
        dataLabel.hide();
    } else if (dataLabel) {
        dataLabel.show();
    }
};

export function getChartProperties(config: IChartConfig, type: VisType) {
    return {
        xAxisProps:  isBarChart(type) ? { ...config.yaxis } : { ...config.xaxis },
        yAxisProps: isBarChart(type) ? { ...config.xaxis } : { ...config.yaxis }
    };
}

export const hideAllLabels = ({ series }: any) => hideDataLabels(flatMap(series, s => s.points));

export const showAllLabels = ({ series }: any) => showDataLabels(flatMap(series, s => s.points));

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

export function getShapeAttributes(point: any) {
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

export function getDataLabelAttributes(point: any) {
    const dataLabel = get(point, 'dataLabel', null);
    const parentGroup = get(point, 'dataLabel.parentGroup', null);

    const labelSafeOffset = -100; // labels outside axis range have typically -9999, hide them
    const labelVisible = dataLabel && dataLabel.x > labelSafeOffset && dataLabel.y > labelSafeOffset;

    if (dataLabel && parentGroup && labelVisible) {
        return {
            x: dataLabel.x + parentGroup.translateX,
            y: dataLabel.y + parentGroup.translateY,
            width: dataLabel.width,
            height: dataLabel.height
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
    const yMax = Number(get(chartOptions, 'yAxisProps.max'));
    const yMin = Number(get(chartOptions, 'yAxisProps.min'));

    if (!yMax && !yMin) {
        return false;
    }

    const { minDataValue, maxDataValue } = getDataExtremeDataValues(chartOptions);

    return (yMax && maxDataValue > yMax) || (yMin && minDataValue < yMin);
}

function getNonStackedMaxValue(series: any): number {
    return series.reduce((maxValue: number, serie: ISeriesItem) => {
        const maxSerieValue = getSerieMaxDataValue(serie.data).y;
        return maxValue > maxSerieValue ? maxValue : maxSerieValue;
    }, 0);
}

function getNonStackedMinValue(series: any, startValue: number): number {
    return series.reduce((minValue: number, serie: ISeriesItem) => {
        const minSerieValue = getSerieMinDataValue(serie.data).y;
        return minValue < minSerieValue ? minValue : minSerieValue;
    }, startValue);
}

function getDataExtremeDataValues(chartOptions: any) {
    const series = chartOptions.data.series;

    const maxDataValue = chartOptions.hasStackByAttribute
        ? getStackedMaxValue(chartOptions.data.series)
        : getNonStackedMaxValue(series);

    const minDataValue = chartOptions.hasStackByAttribute
        ? getStackedMinValue(chartOptions.data.series)
        : getNonStackedMinValue(series, maxDataValue);

    return { minDataValue, maxDataValue };
}

function getSerieMaxDataValue(serieData: ISeriesDataItem[]): ISeriesDataItem {
    return maxBy(serieData, (item: ISeriesDataItem) => item.y);
}

function getSerieMinDataValue(serieData: ISeriesDataItem[]): ISeriesDataItem {
    return minBy(serieData, (item: ISeriesDataItem) => item.y);
}

function getStackedMaxValue(series: ISeriesItem[]) {
    const seriesData = flatten(zip(series.map(serie => serie.data)));
    const stackSums: number[] = [];

    // tslint:disable-next-line:forin
    for (const index in seriesData[0]) {
        stackSums.push(sum(seriesData.map(data => data[index].y)));
    }

    return max(stackSums);
}

function getStackedMinValue(series: ISeriesItem[]) {
    const seriesData = flatten(zip(series.map(serie => serie.data)));
    const stackSums: number[] = [];

    // tslint:disable-next-line:forin
    for (const index in seriesData[0]) {
        stackSums.push(sum(seriesData.map(data => data[index].y)));
    }

    return min(stackSums);
}

export function shouldStartOrEndOnTick(max: string, min: string) {
    if (max && min) {
        return Number(min) > Number(max);
    }

    if (!max && !min) {
        return true;
    }

    return false;
}
