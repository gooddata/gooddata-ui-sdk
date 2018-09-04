// (C) 2007-2018 GoodData Corporation
import sortBy = require('lodash/sortBy');

import {
    isStacked,
    getDataPointsOfVisibleSeries,
    toNeighbors,
    isIntersecting,
    getShapeAttributes,
    IRectBySize
} from '../../helpers';

import {
    hideDataLabels,
    hideDataLabel,
    hasDataLabel,
    getDataLabelAttributes,
    showDataLabelInsideChart
} from '../../dataLabelsHelpers';

const toggleStackedChartLabels = (visiblePoints: any, chartBox: IRectBySize) => {
    const intersectionFound = visiblePoints
        .filter(hasDataLabel)
        .some((point: any) => {
            const { dataLabel, shapeArgs } = point;

            if (dataLabel && shapeArgs) {
                const dataLabelAttr = getDataLabelAttributes(point);
                const shapeAttr = getShapeAttributes(point);
                return dataLabelAttr.height + (2 * dataLabel.padding) > shapeAttr.height;
            }
            return false;
        });

    if (intersectionFound) {
        hideDataLabels(visiblePoints);
    } else {
        visiblePoints.filter(hasDataLabel).forEach((point: any) => {
            const { dataLabel, shapeArgs } = point;
            if (dataLabel && shapeArgs) {
                const dataLabelAttr = getDataLabelAttributes(point);
                const shapeAttr = getShapeAttributes(point);
                const labelWidth = dataLabelAttr.width + (2 * dataLabel.padding);
                const foundIntersection = labelWidth > shapeAttr.width;
                // switch axis for bar chart
                return foundIntersection ? hideDataLabel(point) : showDataLabelInsideChart(point, chartBox, 'vertical');
            }
            return null;
        });
    }
};

const toggleNonStackedChartLabels = (
    points: any,
    chartBox: IRectBySize,
    shouldCheckShapeIntersection: boolean = false
) => {
    const sortedPoints = sortBy(points, (a, b) => {
        const firstLabelAttr = getDataLabelAttributes(a);
        const nextLabelAttr = getDataLabelAttributes(b);
        return firstLabelAttr.y - nextLabelAttr.y;
    });

    const neighbors = toNeighbors(sortedPoints);
    const intersectionFound = neighbors.some(([firstPoint, nextPoint]) => {
        const firstDataLabelAttr = getDataLabelAttributes(firstPoint);
        const nextDataLabelAttr = getDataLabelAttributes(nextPoint);

        if (shouldCheckShapeIntersection) {
            const firstShapeAttr = getShapeAttributes(firstPoint);
            const nextShapeAttr = getShapeAttributes(nextPoint);

            return isIntersecting(firstDataLabelAttr, nextDataLabelAttr) ||
                isIntersecting(firstDataLabelAttr, nextShapeAttr) ||
                isIntersecting(firstShapeAttr, nextDataLabelAttr);
        }

        return isIntersecting(firstDataLabelAttr, nextDataLabelAttr);
    });

    if (intersectionFound) {
        hideDataLabels(points);
    } else {
        points.forEach((point: any) => showDataLabelInsideChart(point, chartBox, 'vertical'));
    }
};

export const autohideBarLabels = (chart: any) => {
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const chartBox: IRectBySize = chart.plotBox;

    if (isStacked(chart)) {
        toggleStackedChartLabels(visiblePoints, chartBox);
    } else {
        toggleNonStackedChartLabels(visiblePoints, chartBox, true);
    }
};

export const handleBarLabelsOutsideChart = (chart: any) => {
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const chartBox: IRectBySize = chart.plotBox;
    visiblePoints.forEach((point: any) => showDataLabelInsideChart(point, chartBox, 'vertical'));
};
