// (C) 2007-2020 GoodData Corporation
import sortBy from "lodash/sortBy";

import {
    isStacked,
    toNeighbors,
    isIntersecting,
    getShapeAttributes,
    getAxisRangeForAxes,
    getDataPointsOfVisibleSeries,
    IAxisRangeForAxes,
} from "../../helpers";

import {
    hideDataLabels,
    hideDataLabel,
    hasDataLabel,
    getDataLabelAttributes,
    showDataLabelInAxisRange,
    showStackLabelInAxisRange,
    getShapeVisiblePart,
} from "../../dataLabelsHelpers";

const toggleStackedChartLabels = (visiblePoints: any, axisRangeForAxes: IAxisRangeForAxes) => {
    const intersectionFound = visiblePoints.filter(hasDataLabel).some((point: any) => {
        const { dataLabel, shapeArgs } = point;

        if (dataLabel && shapeArgs) {
            const dataLabelAttr = getDataLabelAttributes(point);
            const shapeAttr = getShapeAttributes(point);
            return dataLabelAttr.height + 2 * dataLabel.padding > shapeAttr.height;
        }
        return false;
    });

    if (intersectionFound) {
        hideDataLabels(visiblePoints);
    } else {
        visiblePoints.filter(hasDataLabel).forEach((point: any) => {
            const {
                dataLabel,
                shapeArgs,
                series: { chart },
            } = point;
            if (dataLabel && shapeArgs) {
                const dataLabelAttr = getDataLabelAttributes(point);
                const shapeAttr = getShapeAttributes(point);
                const labelWidth = dataLabelAttr.width + 2 * dataLabel.padding;
                const shapeWidth = getShapeVisiblePart(shapeArgs, chart, shapeAttr.width);

                const foundIntersection = labelWidth > shapeWidth;
                // switch axis for bar chart
                return foundIntersection
                    ? hideDataLabel(point)
                    : showStackLabelInAxisRange(point, axisRangeForAxes);
            }
            return null;
        });
    }
};

const toggleNonStackedChartLabels = (
    points: any,
    axisRangeForAxes: IAxisRangeForAxes,
    shouldCheckShapeIntersection: boolean = false,
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

            return (
                isIntersecting(firstDataLabelAttr, nextDataLabelAttr) ||
                isIntersecting(firstDataLabelAttr, nextShapeAttr) ||
                isIntersecting(firstShapeAttr, nextDataLabelAttr)
            );
        }

        return isIntersecting(firstDataLabelAttr, nextDataLabelAttr);
    });

    if (intersectionFound) {
        hideDataLabels(points);
    } else {
        points.forEach((point: any) => showDataLabelInAxisRange(point, point.y, axisRangeForAxes));
    }
};

export const autohideBarLabels = (chart: any) => {
    const isStackedChart = isStacked(chart);
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRangeForAxes: IAxisRangeForAxes = getAxisRangeForAxes(chart);

    if (isStackedChart) {
        toggleStackedChartLabels(visiblePoints, axisRangeForAxes);
    } else {
        toggleNonStackedChartLabels(visiblePoints, axisRangeForAxes, true);
    }
};

export const handleBarLabelsOutsideChart = (chart: any) => {
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRangeForAxes: IAxisRangeForAxes = getAxisRangeForAxes(chart);

    visiblePoints.forEach((point: any) => {
        if (!isStacked(chart)) {
            showDataLabelInAxisRange(point, point.y, axisRangeForAxes);
        } else {
            // fix for HCH bug for negative stack labels
            showStackLabelInAxisRange(point, axisRangeForAxes);
        }
    });
};
