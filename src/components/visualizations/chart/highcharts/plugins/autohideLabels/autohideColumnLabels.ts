// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import map = require("lodash/map");
import zip = require("lodash/zip");
import values = require("lodash/values");
import flatten = require("lodash/flatten");
import identity = require("lodash/identity");
import isEmpty = require("lodash/isEmpty");
import Highcharts from "../../highchartsEntryPoint";

import {
    isStacked,
    toNeighbors,
    isIntersecting,
    getShapeAttributes,
    getAxisRangeForAxes,
    getDataPointsOfVisibleSeries,
    IAxisRangeForAxes,
    IRectBySize,
} from "../../helpers";

import {
    areLabelsStacked,
    getDataLabelAttributes,
    hasDataLabel,
    hideDataLabels,
    hideDataLabel,
    showDataLabelInAxisRange,
    showStackLabelInAxisRange,
    getShapeVisiblePart,
    hasShape,
    hasLabelInside,
} from "../../dataLabelsHelpers";
import { VisualizationTypes } from "../../../../../../constants/visualizationTypes";
import {
    IPointData,
    IAxisConfig,
    ISeriesItem,
    IStackItem,
    IClientRect,
    IDataLabelsConfig,
} from "../../../../../../interfaces/Config";

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
    ).some(pointPair => {
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

const toggleStackedChartLabels = (visiblePoints: any, axisRangeForAxes: IAxisRangeForAxes) => {
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

export function isOverlappingWidth(visiblePoints: IPointData[]) {
    return visiblePoints.filter(hasDataLabel).some((point: IPointData) => {
        const { dataLabel, shapeArgs } = point;

        if (dataLabel && shapeArgs) {
            const labelWidth = dataLabel.width + 2 * dataLabel.padding;
            return labelWidth > shapeArgs.width;
        }
        return false;
    });
}

export function areNeighborsOverlapping(neighbors: IDataLabelsConfig[][]): boolean {
    return neighbors.some(labelsPair => {
        const [firstLabel, nextLabel]: IDataLabelsConfig[] = labelsPair || [];

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
export function areLabelsOverlappingColumns(labels: IPointData[], visiblePoints: IPointData[]): boolean {
    return labels.some((label: IPointData) => {
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

        return visiblePoints.some((point: IPointData) => {
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
export function getStackLabelPointsForDualAxis(stacks: any[]) {
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

export function getStackTotalGroups(yAxis: IAxisConfig[]): Highcharts.SVGAttributes[] {
    return flatten(
        yAxis.map((axis: IAxisConfig) => {
            if (!isEmpty(axis.stacks)) {
                return axis.stackTotalGroup;
            }
            return axis.series.map((serie: ISeriesItem) => serie.dataLabelsGroup);
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
    const { stackTotalGroup, stacks }: any = yAxis[0] || {};

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

export const autohideColumnLabels = (chart: any) => {
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

export function getLabelOrDataLabelForPoints(points: IPointData[]): IPointData[] {
    return points
        .map((point: IPointData) => {
            return point.label || point.dataLabel;
        })
        .filter(identity);
}

export function getStackItems(yAxis: IAxisConfig[]): IStackItem[] {
    return flatten(
        yAxis.map((axis: IAxisConfig) => {
            if (!isEmpty(axis.stacks)) {
                return axis.stacks;
            }
            const series = axis.series;
            const dataLabels: IStackItem[] = series.map((serie: ISeriesItem) => {
                return {
                    column: { ...serie.data },
                };
            });
            return dataLabels;
        }),
    );
}
