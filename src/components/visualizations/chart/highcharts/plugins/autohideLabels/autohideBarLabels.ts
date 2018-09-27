// (C) 2007-2018 GoodData Corporation
import sortBy = require('lodash/sortBy');

import {
    isStacked,
    getDataPointsOfVisibleSeries,
    toNeighbors,
    isIntersecting,
    getShapeAttributes,
    getAxisRange,
    IAxisRange
} from '../../helpers';

import {
    hideDataLabels,
    hideDataLabel,
    hasDataLabel,
    getDataLabelAttributes,
    showDataLabelInAxisRange,
    showStackLabelInAxisRange
} from '../../dataLabelsHelpers';

const toggleStackedChartLabels = (visiblePoints: any, axisRange: IAxisRange) => {
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
                return foundIntersection ?
                    hideDataLabel(point) :
                    showStackLabelInAxisRange(point, axisRange);
            }
            return null;
        });
    }
};

const toggleNonStackedChartLabels = (
    points: any,
    axisRange: IAxisRange,
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
        points.forEach((point: any) => showDataLabelInAxisRange(point, point.y, axisRange));
    }
};

export const autohideBarLabels = (chart: any) => {
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRange: IAxisRange = getAxisRange(chart);

    if (isStacked(chart)) {
        toggleStackedChartLabels(visiblePoints, axisRange);
    } else {
        toggleNonStackedChartLabels(visiblePoints, axisRange, true);
    }
};

export const handleBarLabelsOutsideChart = (chart: any) => {
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRange: IAxisRange = getAxisRange(chart);

    visiblePoints.forEach((point: any) => {
        if (!isStacked(chart)) {
            showDataLabelInAxisRange(point, point.y, axisRange);
        } else { // fix for HCH bug for negative stack labels
            showStackLabelInAxisRange(point, axisRange);
        }
    });
};
