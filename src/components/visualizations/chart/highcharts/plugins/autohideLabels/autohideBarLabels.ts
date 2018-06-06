// (C) 2007-2018 GoodData Corporation
import sortBy = require('lodash/sortBy');
import get = require('lodash/get');

import {
    isStacked,
    getVisibleSeries,
    getDataPoints,
    hideDataLabels,
    hideDataLabel,
    hasDataLabel,
    toNeighbors,
    isIntersecting,
    getDataLabelAttributes,
    getShapeAttributes,
    showDataLabelInAxisRange
} from '../../helpers';

const toggleStackedChartLabels = (visiblePoints: any,  minAxisValue: number) => {
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
                return foundIntersection ? hideDataLabel(point) : showDataLabelInAxisRange(point, minAxisValue);
            }
            return null;
        });
    }
};

const toggleNonStackedChartLabels = (
    points: any,
    minAxisValue: number,
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
        points.forEach((point: any) => showDataLabelInAxisRange(point, minAxisValue));
    }
};

const autohideBarLabels = (chart: any) => {
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);
    const minAxisValue = get(chart, ['yAxis', 0, 'min'], 0);

    if (isStacked(chart)) {
        toggleStackedChartLabels(visiblePoints, minAxisValue);
    } else {
        toggleNonStackedChartLabels(visiblePoints, minAxisValue, true);
    }
};

export default autohideBarLabels;
