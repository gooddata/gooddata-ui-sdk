// (C) 2007-2020 GoodData Corporation
import get from "lodash/get";
import map from "lodash/map";
import zip from "lodash/zip";
import values from "lodash/values";
import flatten from "lodash/flatten";
import identity from "lodash/identity";
import isEmpty from "lodash/isEmpty";
import Highcharts from "../../../lib";

import {
    getAxisRangeForAxes,
    getDataPointsOfVisibleSeries,
    getShapeAttributes,
    IAxisRangeForAxes,
    IRectBySize,
    isIntersecting,
    isStacked,
    toNeighbors,
} from "../../../chartTypes/_chartCreators/helpers";

import {
    areLabelsStacked,
    getDataLabelAttributes,
    getShapeVisiblePart,
    hasDataLabel,
    hasLabelInside,
    hasShape,
    hideDataLabel,
    hideDataLabels,
    showDataLabelInAxisRange,
    showStackLabelInAxisRange,
} from "../../../chartTypes/_chartCreators/dataLabelsHelpers";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { UnsafeInternals, IUnsafeDataLabels, IClientRect, IStackItem } from "../../../typings/unsafe";

/*
 * Code in this file accesses Highchart.Axis and Highchart.Series properties that are not included in
 * the official typings:
 *
 * -  Axis.stacks
 * -  Axis.stackTotalGroup
 * -  Series.dataLabelsGroup
 *
 * For some time, we included the 'extra' stuff in our own types (IAxisConfig). This type was in return
 * used in IChartConfig. The chart config should not be riddled with highchart internals - so that went away
 * and code here started to use Highchart types instead.
 *
 * By using the public Highchart types, the use of undocumented fields became more apparent. Instead of creating
 * types for these internals that we misuse (?), I have opted to casting as UnsafeInternals and accessing
 */

const toggleNonStackedChartLabels = (
    visiblePoints: any,
    axisRangeForAxes: IAxisRangeForAxes,
    shouldCheckShapeIntersection: boolean = false,
) => {
    const foundIntersection = toNeighbors(
        // some data labels may not be rendered (too many points)
        visiblePoints.filter((point: any) => {
            return hasDataLabel(point) && hasShape(point);
        }),
    ).some((pointPair) => {
        const [firstPoint, nextPoint]: any[] = pointPair || [];
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

    if (foundIntersection) {
        hideDataLabels(visiblePoints);
    } else {
        visiblePoints.forEach((point: any) => showDataLabelInAxisRange(point, point.y, axisRangeForAxes));
    }
};

const toggleStackedChartLabels = (visiblePoints: Highcharts.Point[], axisRangeForAxes: IAxisRangeForAxes) => {
    const toggleLabel = (point: any) => {
        const {
            dataLabel,
            shapeArgs,
            series: { chart },
        } = point;
        if (dataLabel && shapeArgs) {
            const labelHeight = dataLabel.height + (2 * dataLabel.padding || 0);
            const shapeHeight = getShapeVisiblePart(shapeArgs, chart, shapeArgs.height);
            const isOverlappingHeight = labelHeight > shapeHeight;
            return isOverlappingHeight
                ? hideDataLabel(point)
                : // fix for HCH bug for negative stack labels
                  showStackLabelInAxisRange(point, axisRangeForAxes);
        }

        return null;
    };

    if (isOverlappingWidth(visiblePoints)) {
        hideDataLabels(visiblePoints);
    } else {
        visiblePoints.forEach(toggleLabel);
    }
};

export function isOverlappingWidth(visiblePoints: Highcharts.Point[]): boolean {
    return visiblePoints.filter(hasDataLabel).some((point: UnsafeInternals) => {
        const { dataLabel, shapeArgs } = point;

        if (dataLabel && shapeArgs) {
            const labelWidth = dataLabel.width + 2 * dataLabel.padding;
            return labelWidth > shapeArgs.width;
        }
        return false;
    });
}

export function areNeighborsOverlapping(neighbors: IUnsafeDataLabels[][]): boolean {
    return neighbors.some((labelsPair) => {
        const [firstLabel, nextLabel]: IUnsafeDataLabels[] = labelsPair || [];

        if (!isEmpty(firstLabel) && !isEmpty(nextLabel)) {
            const firstClientRect: IClientRect = firstLabel.element.getBoundingClientRect();
            const nextClientRect: IClientRect = nextLabel.element.getBoundingClientRect();

            if (firstClientRect && nextClientRect) {
                const firstLabelRight = firstClientRect.right;
                const nextLabelLeft = nextClientRect.left;
                return firstLabelRight > nextLabelLeft;
            }
        }
        return false;
    });
}

// Check if Total label overlapping other columns
export function areLabelsOverlappingColumns(
    labels: Highcharts.Point[],
    visiblePoints: Highcharts.Point[],
): boolean {
    return labels.some((label: UnsafeInternals) => {
        if (isEmpty(label)) {
            return false;
        }

        const { x, y, width, height }: IClientRect = label.element.getBoundingClientRect();
        const labelAttr: IRectBySize = {
            x,
            y,
            width,
            height,
        };

        return visiblePoints.some((point: UnsafeInternals) => {
            const seriesType: string = get(point, "series.options.type");
            if (
                isEmpty(point) ||
                isEmpty(point.graphic) ||
                // supportedDualAxesChartTypes is including AREA and LINE
                // won't hide the stacked label if it overlaps with points of AREA and LINE
                seriesType === VisualizationTypes.AREA ||
                seriesType === VisualizationTypes.LINE
            ) {
                return false;
            }

            const { x, y, width, height }: IClientRect = point.graphic.element.getBoundingClientRect();
            const pointAttr: IRectBySize = {
                x,
                y,
                width,
                height,
            };

            return isIntersecting(pointAttr, labelAttr);
        });
    });
}

function findColumnKey(key: string): boolean {
    return key.indexOf("column") === 0;
}

/**
 * Merge stack label points from axes to one
 * Primary axis:    [pointP1, pointP2, pointP3]
 * Secondary axis:  [pointS1, pointS2, pointS3]
 * @param stacks
 * @return [pointP1, pointS1, pointP2, pointS2, pointP3, pointS3]
 */
export function getStackLabelPointsForDualAxis(stacks: UnsafeInternals[]): Highcharts.Point[] {
    return flatten(
        // 'column0' is primary axis and 'column1' is secondary axis
        zip(
            ...stacks.map((item: any) => {
                const columnKey = Object.keys(item).find(findColumnKey);
                return values(item[columnKey]);
            }),
        ),
    ).filter(identity);
}

export function getStackTotalGroups(yAxis: Highcharts.Axis[]): Highcharts.SVGAttributes[] {
    return flatten(
        yAxis.map((axis: Highcharts.Axis) => {
            if (!isEmpty((axis as UnsafeInternals).stacks)) {
                return (axis as UnsafeInternals).stackTotalGroup;
            }
            return axis.series.map((serie: Highcharts.Series) => (serie as UnsafeInternals).dataLabelsGroup);
        }),
    ).filter(identity);
}

function toggleStackedLabelsForDualAxis() {
    const { yAxis } = this;

    const stackTotalGroups = getStackTotalGroups(yAxis);
    const stacks = getStackItems(yAxis);

    if (stacks && stackTotalGroups) {
        const points = getStackLabelPointsForDualAxis(stacks);
        const labels = getLabelOrDataLabelForPoints(points);
        const neighbors = toNeighbors(labels);
        const neighborsOverlapping = areNeighborsOverlapping(neighbors);

        const areOverlapping = neighborsOverlapping
            ? true
            : areLabelsOverlappingColumns(labels, getDataPointsOfVisibleSeries(this));

        if (areOverlapping) {
            this.userOptions.stackLabelsVisibility = "hidden";
            stackTotalGroups.forEach((stackTotalGroup: Highcharts.SVGAttributes) => stackTotalGroup.hide());
        } else {
            this.userOptions.stackLabelsVisibility = "visible";
            stackTotalGroups.forEach((stackTotalGroup: Highcharts.SVGAttributes) => stackTotalGroup.show());
        }
    }
}

function toggleStackedLabelsForSingleAxis() {
    const { yAxis } = this;
    const { stackTotalGroup, stacks }: UnsafeInternals = yAxis[0] || {};

    if (stacks && stackTotalGroup) {
        const columnKey = Object.keys(stacks).find(findColumnKey);
        // We need to use Lodash map, because we are iterating through an object
        const labels = map(stacks[columnKey], (point: any) => point.label);
        const neighbors = toNeighbors(labels);
        const areOverlapping = areNeighborsOverlapping(neighbors);

        if (areOverlapping) {
            this.userOptions.stackLabelsVisibility = "hidden";
            stackTotalGroup.hide();
        } else {
            this.userOptions.stackLabelsVisibility = "visible";
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
    return toggleStackedLabelsForSingleAxis.call(this);
}

export const autohideColumnLabels = (chart: Highcharts.Chart): void => {
    const isStackedChart = isStacked(chart);
    const hasLabelsStacked = areLabelsStacked(chart);

    const visiblePoints = getDataPointsOfVisibleSeries(chart);
    const axisRangeForAxes: IAxisRangeForAxes = getAxisRangeForAxes(chart);

    // stack chart labels is displayed inside column
    if (isStackedChart) {
        toggleStackedChartLabels(visiblePoints.filter(hasLabelInside), axisRangeForAxes);
    } else {
        toggleNonStackedChartLabels(visiblePoints, axisRangeForAxes, true);
    }

    // stack labels are total values displayed on top of columns
    if (hasLabelsStacked) {
        toggleStackedLabels.call(chart);
    }
};

export const handleColumnLabelsOutsideChart = (chart: Highcharts.Chart): void => {
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

export function getLabelOrDataLabelForPoints(points: Highcharts.Point[]): Highcharts.Point[] {
    return points
        .map((point: UnsafeInternals) => {
            return point.label || point.dataLabel;
        })
        .filter(identity);
}

export function getStackItems(yAxis: Highcharts.Axis[]): IStackItem[] {
    return flatten(
        yAxis.map((axis: Highcharts.Axis) => {
            if (!isEmpty((axis as UnsafeInternals).stacks)) {
                return (axis as UnsafeInternals).stacks;
            }
            const series = axis.series;
            const dataLabels: IStackItem[] = series.map((serie: Highcharts.Series) => {
                return {
                    column: { ...serie.data },
                };
            });
            return dataLabels;
        }),
    );
}
