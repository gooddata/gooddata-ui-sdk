// (C) 2007-2022 GoodData Corporation
import sortBy from "lodash/sortBy.js";

import {
    isStacked,
    toNeighbors,
    isIntersecting,
    getShapeAttributes,
    getAxisRangeForAxes,
    getDataPointsOfVisibleSeries,
    IAxisRangeForAxes,
} from "../../../chartTypes/_chartCreators/helpers.js";

import {
    hideDataLabels,
    hideDataLabel,
    hasDataLabel,
    getDataLabelAttributes,
    showDataLabelInAxisRange,
    showStackLabelInAxisRange,
    getShapeVisiblePart,
    areLabelsStacked,
    setStackVisibilityByOpacity,
} from "../../../chartTypes/_chartCreators/dataLabelsHelpers.js";
import { areLabelsOverlappingColumns, getStackItems, getStackTotalGroups } from "./autohideColumnLabels.js";

const toggleStackedChartLabels = (visiblePoints: any[], axisRangeForAxes: IAxisRangeForAxes) => {
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const autohideBarLabels = (chart: any): void => {
    const isStackedChart = isStacked(chart);
    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRangeForAxes: IAxisRangeForAxes = getAxisRangeForAxes(chart);

    if (isStackedChart) {
        toggleStackedChartLabels(visiblePoints, axisRangeForAxes);
    } else {
        toggleNonStackedChartLabels(visiblePoints, axisRangeForAxes, true);
    }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleBarLabelsOutsideChart = (chart: any): void => {
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

export const autohideBarTotalLabels = (chart: Highcharts.Chart): void => {
    // stack labels are total values displayed on top of columns
    if (areLabelsStacked(chart)) {
        toggleStackedLabels.call(chart);
    }
};

function toggleStackedLabels() {
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

export function toggleStackedLabelsForAxis() {
    const { yAxis } = this;
    const stackTotalGroups = getStackTotalGroups(yAxis);
    const stacks = getStackItems(yAxis);

    if (stacks && stackTotalGroups) {
        const areOverlapping = areLabelsOverlappingColumns(
            getStackedLabels(stacks),
            getDataPointsOfVisibleSeries(this),
        );

        stackTotalGroups.forEach((stackTotalGroup: Highcharts.SVGAttributes) =>
            setStackVisibilityByOpacity(stackTotalGroup, !areOverlapping),
        );
    }
}
