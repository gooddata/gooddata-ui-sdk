// (C) 2007-2025 GoodData Corporation

import { sortBy } from "lodash-es";

import { VisualizationTypes } from "@gooddata/sdk-ui";

import { areLabelsOverlappingColumns, getStackItems, getStackTotalGroups } from "./autohideColumnLabels.js";
import {
    areLabelsStacked,
    getDataLabelAttributes,
    getShapeVisiblePart,
    hasDataLabel,
    hideDataLabel,
    hideDataLabels,
    setStackVisibilityByOpacity,
    showDataLabelInAxisRange,
    showStackLabelInAxisRange,
} from "../../../chartTypes/_chartCreators/dataLabelsHelpers.js";
import {
    IAxisRangeForAxes,
    getAxisRangeForAxes,
    getAxisWithCategories,
    getDataPointsOfVisibleSeries,
    getPointsVisibleInAxisRange,
    getShapeAttributes,
    isIntersecting,
    isPointVisibleInAxisRange,
    isStacked,
    toNeighbors,
} from "../../../chartTypes/_chartCreators/helpers.js";
import { Axis } from "../../../lib/index.js";

const toggleStackedChartLabels = (
    visiblePoints: any[],
    axisRangeForAxes: IAxisRangeForAxes,
    zoomableAxis?: Axis,
) => {
    const intersectionFound = visiblePoints.filter(hasDataLabel).some((point) => {
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
        visiblePoints.filter(hasDataLabel).forEach((point) => {
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
                    : showStackLabelInAxisRange(
                          point,
                          axisRangeForAxes,
                          isPointVisibleInAxisRange(point, zoomableAxis),
                      );
            }
            return null;
        });
    }
};

const toggleNonStackedChartLabels = (
    points: any,
    axisRangeForAxes: IAxisRangeForAxes,
    shouldCheckShapeIntersection: boolean = false,
    zoomableAxis?: Axis,
) => {
    // for intersection detection keep only points visible within axis range
    const visiblePoints = getPointsVisibleInAxisRange(points, zoomableAxis);
    const sortedPoints = sortBy(visiblePoints, (a, b) => {
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
        points.forEach((point: any) =>
            showDataLabelInAxisRange(
                point,
                point.y,
                axisRangeForAxes,
                isPointVisibleInAxisRange(point, zoomableAxis),
            ),
        );
    }
};

export const autohideBarLabels = (chart: any): void => {
    const isStackedChart = isStacked(chart);
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRangeForAxes: IAxisRangeForAxes = getAxisRangeForAxes(chart);
    const zoomableAxis = getAxisWithCategories(chart);

    if (isStackedChart) {
        toggleStackedChartLabels(visiblePoints, axisRangeForAxes, zoomableAxis);
    } else {
        toggleNonStackedChartLabels(visiblePoints, axisRangeForAxes, true, zoomableAxis);
    }
};

export const handleBarLabelsOutsideChart = (chart: Highcharts.Chart): void => {
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRangeForAxes: IAxisRangeForAxes = getAxisRangeForAxes(chart);
    const axisWithCategories = getAxisWithCategories(chart);

    visiblePoints.forEach((point: Highcharts.Point) => {
        if (isStacked(chart)) {
            // fix for HCH bug for negative stack labels
            showStackLabelInAxisRange(
                point,
                axisRangeForAxes,
                isPointVisibleInAxisRange(point, axisWithCategories),
            );
        } else {
            showDataLabelInAxisRange(
                point,
                point.y,
                axisRangeForAxes,
                isPointVisibleInAxisRange(point, axisWithCategories),
            );
        }
    });
};

export const autohideBarTotalLabels = (chart: Highcharts.Chart): void => {
    // stack labels are total values displayed on top of columns
    if (areLabelsStacked(chart)) {
        toggleStackedLabels.call(chart);
    }
};

function toggleStackedLabels(this: any) {
    const { yAxis } = this;

    // CL-10676 - Return if yAxis is undefined
    if (!yAxis || yAxis.length === 0) {
        return;
    }

    toggleStackedLabelsForAxis.call(this);
}

function getStackedLabels(stacks: any): any[] {
    const labels: any[] = [];

    for (const stackName in stacks) {
        for (const itemName in stacks[stackName]) {
            for (const item in stacks[stackName][itemName]) {
                labels.push(stacks[stackName][itemName][item].label);
            }
        }
    }
    return labels;
}

export function toggleStackedLabelsForAxis(this: any) {
    const { yAxis } = this;
    const stackTotalGroups = getStackTotalGroups(yAxis);
    const stacks = getStackItems(yAxis);

    if (stacks && stackTotalGroups) {
        const areOverlapping = areLabelsOverlappingColumns(
            getStackedLabels(stacks),
            getDataPointsOfVisibleSeries(this),
            VisualizationTypes.BAR,
        );

        stackTotalGroups.forEach((stackTotalGroup: Highcharts.SVGAttributes) =>
            setStackVisibilityByOpacity(stackTotalGroup, !areOverlapping),
        );
    }
}
