// (C) 2007-2018 GoodData Corporation
import map = require('lodash/map');
import {
    getVisibleSeries,
    getDataPoints,
    isStacked,
    areLabelsStacked,
    toNeighbors,
    isIntersecting,
    getDataLabelAttributes,
    getShapeAttributes,
    hasDataLabel,
    showDataLabel,
    hideDataLabel,
    showDataLabels,
    hideDataLabels
} from '../../helpers';

const toggleNonStackedChartLabels = (visiblePoints: any, shouldCheckShapeIntersection: boolean = false) => {
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
        showDataLabels(visiblePoints);
    }
};

const toggleStackedChartLabels = (visiblePoints: any) => {
    const toggleLabel = (point: any) => {
        const { dataLabel, shapeArgs } = point;
        if (dataLabel && shapeArgs) {
            const labelHeight = dataLabel.height + (2 * dataLabel.padding || 0);
            const isOverlappingHeight = labelHeight > shapeArgs.height;
            return isOverlappingHeight ? hideDataLabel(point) : showDataLabel(point);
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

function toggleStackedLabels() {
    const { yAxis } = this;

    // CL-10676 - Return if yAxis is undefined
    if (!yAxis || yAxis.length === 0) {
        return;
    }
    const { stackTotalGroup, stacks }: any = yAxis[0] || {};

    if (stacks && stackTotalGroup) {
        // We need to use Lodash map, because we are iterating through an object
        const labels = map(yAxis[0].stacks.column, (point: any) => point.label);
        const neighbors = toNeighbors(labels);

        const neighborsAreOverlapping = neighbors.some((labelsPair) => {
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

        if (neighborsAreOverlapping) {
            this.userOptions.stackLabelsVisibility = 'hidden';
            stackTotalGroup.hide();
        } else {
            this.userOptions.stackLabelsVisibility = 'visible';
            stackTotalGroup.show();
        }
    }
}

const autohideColumnLabels = (chart: any) => {
    const isStackedChart = isStacked(chart);
    const hasLabelsStacked = areLabelsStacked(chart);
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);

    if (isStackedChart) {
        toggleStackedChartLabels(visiblePoints);
    } else {
        toggleNonStackedChartLabels(visiblePoints, true);
    }
    if (hasLabelsStacked) {
        toggleStackedLabels.call(chart);
    }
};

export default autohideColumnLabels;
