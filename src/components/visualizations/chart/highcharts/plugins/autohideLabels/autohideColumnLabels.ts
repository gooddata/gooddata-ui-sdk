// (C) 2007-2018 GoodData Corporation
import map = require('lodash/map');
import zip = require('lodash/zip');
import values = require('lodash/values');
import flatten = require('lodash/flatten');

import {
    isStacked,
    toNeighbors,
    isIntersecting,
    getShapeAttributes,
    getAxisRangeForAxes,
    getDataPointsOfVisibleSeries,
    IAxisRangeForAxes
} from '../../helpers';

import {
    areLabelsStacked,
    getDataLabelAttributes,
    hasDataLabel,
    hideDataLabels,
    hideDataLabel,
    showDataLabelInAxisRange,
    showStackLabelInAxisRange,
    getShapeVisiblePart
} from '../../dataLabelsHelpers';

const toggleNonStackedChartLabels = (
    visiblePoints: any,
    axisRangeForAxes: IAxisRangeForAxes,
    shouldCheckShapeIntersection: boolean = false) => {
    const foundIntersection = toNeighbors(
        // some data labels may not be rendered (too many points)
        visiblePoints.filter(hasDataLabel)
    ).some((pointPair) => {
        const [firstPoint, nextPoint]: any[] = pointPair || [];
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

    if (foundIntersection) {
        hideDataLabels(visiblePoints);
    } else {
        visiblePoints.forEach((point: any) => showDataLabelInAxisRange(point, point.y, axisRangeForAxes));
    }
};

const toggleStackedChartLabels = (visiblePoints: any, axisRangeForAxes: IAxisRangeForAxes) => {
    const toggleLabel = (point: any) => {
        const { dataLabel, shapeArgs, series: { chart } } = point;
        if (dataLabel && shapeArgs) {
            const labelHeight = dataLabel.height + (2 * dataLabel.padding || 0);
            const shapeHeight = getShapeVisiblePart(shapeArgs, chart, shapeArgs.height);
            const isOverlappingHeight = labelHeight > shapeHeight;
            return isOverlappingHeight ?
                hideDataLabel(point) :
                // fix for HCH bug for negative stack labels
                showStackLabelInAxisRange(point, axisRangeForAxes);
        }

        return null;
    };

    const isOverlappingWidth = visiblePoints.filter(hasDataLabel).some((point: any) => {
        const { dataLabel } = point;
        if (dataLabel) {
            const labelWidth = dataLabel.width + (2 * dataLabel.padding);
            return labelWidth > point.shapeArgs.width;
        }
        return false;
    });

    if (isOverlappingWidth) {
        hideDataLabels(visiblePoints);
    } else {
        visiblePoints.forEach(toggleLabel);
    }
};

function areNeighborsOverlapping(neighbors: any[]) {
    return neighbors.some((labelsPair) => {
        const [firstLabel, nextLabel]: any[] = labelsPair || [];

        if (firstLabel && nextLabel) {
            if (firstLabel.alignAttr && nextLabel.alignAttr) {
                // We need to calculate this from getBBox, because FireFox does not
                // provide clientWidth attribute
                const firstLabelWidth = firstLabel.element.getBBox().width;
                const firstLabelRight = firstLabel.alignAttr.x + firstLabelWidth;
                const nextLabelLeft = nextLabel.alignAttr.x;
                return firstLabelRight > nextLabelLeft;
            }
        }
        return false;
    });
}

/**
 * Merge stack label points from axes to one
 * Primary axis:    [pointP1, pointP2, pointP3]
 * Secondary axis:  [pointS1, pointS2, pointS3]
 * @param stacks
 * @return [pointP1, pointS1, pointP2, pointS2, pointP3, pointS3]
 */
function getStackLabelPointsForDualAxis(stacks: any[]) {
    return flatten(
        // 'column0' is primary axis and 'column1' is secondary axis
        zip(...stacks.map((item: any, index: number) => values(item[`column${index}`])))
    );
}

function toggleStackedLabelsForDualAxis() {
    const { yAxis } = this;

    const stackTotalGroups = yAxis.map((axis: any) => axis.stackTotalGroup);
    const stacks = yAxis.map((axis: any) => axis.stacks);

    if (stacks && stackTotalGroups) {
        const points = getStackLabelPointsForDualAxis(stacks);
        const labels = points.map((point: any) => point.label);
        const neighbors = toNeighbors(labels);
        const areOverlapping = areNeighborsOverlapping(neighbors);

        if (areOverlapping) {
            this.userOptions.stackLabelsVisibility = 'hidden';
            stackTotalGroups.forEach((stackTotalGroup: any) => stackTotalGroup.hide());
        } else {
            this.userOptions.stackLabelsVisibility = 'visible';
            stackTotalGroups.forEach((stackTotalGroup: any) => stackTotalGroup.show());
        }
    }
}

function toggleStackedLabelsForDualAxisForSingleAxis() {
    const { yAxis } = this;
    const { stackTotalGroup, stacks }: any = yAxis[0] || {};

    if (stacks && stackTotalGroup) {
        // We need to use Lodash map, because we are iterating through an object
        const labels = map(stacks.column, (point: any) => point.label);
        const neighbors = toNeighbors(labels);
        const areOverlapping = areNeighborsOverlapping(neighbors);

        if (areOverlapping) {
            this.userOptions.stackLabelsVisibility = 'hidden';
            stackTotalGroup.hide();
        } else {
            this.userOptions.stackLabelsVisibility = 'visible';
            stackTotalGroup.show();
        }
    }
}

function toggleStackedLabels() {
    const { yAxis } = this;

    // CL-10676 - Return if yAxis is undefined
    if (!yAxis || yAxis.length === 0) {
        return;
    }

    if (yAxis.length === 2) {
        return toggleStackedLabelsForDualAxis.call(this);
    }
    return toggleStackedLabelsForDualAxisForSingleAxis.call(this);
}

export const autohideColumnLabels = (chart: any) => {
    const isStackedChart = isStacked(chart);
    const hasLabelsStacked = areLabelsStacked(chart);

    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRangeForAxes: IAxisRangeForAxes = getAxisRangeForAxes(chart);

    // stack chart labels is displayed inside column
    if (isStackedChart) {
        toggleStackedChartLabels(visiblePoints, axisRangeForAxes);
    } else {
        toggleNonStackedChartLabels(visiblePoints, axisRangeForAxes, true);
    }

    // stack labels are total values displayed on top of columns
    if (hasLabelsStacked) {
        toggleStackedLabels.call(chart);
    }
};

export const handleColumnLabelsOutsideChart = (chart: any) => {
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
