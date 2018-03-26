// (C) 2007-2018 GoodData Corporation
import {
    flatten,
    flatMap,
    get,
    map,
    zip,
    unzip,
    initial,
    tail,
    isEmpty
} from 'lodash';

import { VisualizationTypes } from '../../../../constants/visualizationTypes';

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
    (get(chart, 'userOptions.yAxis.stackLabels.enabled', false) && isStacked(chart));

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

    if (dataLabel && parentGroup) {
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
