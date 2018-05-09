// (C) 2007-2018 GoodData Corporation
import sortBy = require('lodash/sortBy');

import {
    isStacked,
    getVisibleSeries,
    getDataPoints,
    showDataLabels,
    hideDataLabels,
    showDataLabel,
    hideDataLabel,
    hasDataLabel,
    toNeighbors,
    isIntersecting,
    getDataLabelAttributes,
    getShapeAttributes
} from '../../helpers';

const toggleStackedChartLabels = (visiblePoints: any) => {
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
                return foundIntersection ? hideDataLabel(point) : showDataLabel(point);
            }
            return null;
        });
    }
};

const toggleNonStackedChartLabels = (points: any, shouldCheckShapeIntersection: boolean = false) => {
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
        showDataLabels(points);
    }
};

const autohideBarLabels = (chart: any) => {
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);

    if (isStacked(chart)) {
        toggleStackedChartLabels(visiblePoints);
    } else {
        toggleNonStackedChartLabels(visiblePoints, true);
    }
};

export default autohideBarLabels;
