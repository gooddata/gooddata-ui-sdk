// (C) 2007-2020 GoodData Corporation
import flatMap from "lodash/flatMap";
import get from "lodash/get";
import Highcharts from "../../lib";

import {
    isStacked,
    IRectBySize,
    isIntersecting,
    pointInRange,
    IAxisRange,
    IAxisRangeForAxes,
} from "./helpers";
import { isAreaChart, isOneOfTypes } from "../_util/common";
import { IDataLabelsVisible } from "../../../interfaces";
import { BLACK_LABEL, WHITE_LABEL, whiteDataLabelTypes } from "../../constants/label";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isLabelOverlappingItsShape(point: any): boolean {
    const { dataLabel, shapeArgs } = point;
    if (dataLabel && shapeArgs) {
        // shapeArgs for point hidden by legend is undefined
        if (shapeArgs.width === undefined) {
            return dataLabel.width > shapeArgs.r * 2 || dataLabel.height > shapeArgs.r * 2;
        }
        return dataLabel.width > shapeArgs.width || dataLabel.height > shapeArgs.height;
    }
    return false;
}

export const getDataLabelsGdcVisible = (chart: Highcharts.Chart): boolean | string =>
    get(chart, "options.plotOptions.gdcOptions.dataLabels.visible", "auto");

const isLabelsStackedFromYAxis = (chart: Highcharts.Chart): boolean =>
    get(chart, "userOptions.yAxis.0.stackLabels.enabled", false) ||
    get(chart, "userOptions.yAxis.1.stackLabels.enabled", false);

export const areLabelsStacked = (chart: Highcharts.Chart): boolean =>
    isLabelsStackedFromYAxis(chart) && isStacked(chart);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const hasDataLabel = (point: any): boolean => !!point.dataLabel;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const hasShape = (point: any): boolean => !!point.shapeArgs;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const hasLabelInside = (point: any): boolean => {
    const verticalAlign = get(point, "dataLabel.alignOptions.verticalAlign", "");
    return verticalAlign === "middle";
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const minimizeDataLabel = (point: any): void => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.width = 0;
        dataLabel.height = 0;
    }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const hideDataLabel = (point: any): void => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.hide();
    }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const showDataLabel = (point: any): void => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.show();
    }
};

export const hideDataLabels = (points: any[]): void => {
    points.filter(hasDataLabel).forEach(hideDataLabel);
};

export const showDataLabels = (points: any[]): void => {
    points.filter(hasDataLabel).forEach(showDataLabel);
};

export interface IInsideResult {
    vertically: boolean;
    horizontally: boolean;
}

export function showDataLabelInAxisRange(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    point: any,
    value: number,
    axisRangeForAxes: IAxisRangeForAxes,
): void {
    const isSecondAxis = get(point, "series.yAxis.opposite", false);
    const axisRange: IAxisRange = axisRangeForAxes[isSecondAxis ? "second" : "first"];
    const isInsideAxisRange: boolean = pointInRange(value, axisRange);
    if (!isInsideAxisRange) {
        hideDataLabel(point);
    }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function showStackLabelInAxisRange(point: any, axisRangeForAxes: IAxisRangeForAxes): void {
    const isSecondAxis = get(point, "series.yAxis.opposite", false);
    const axisRange: IAxisRange = axisRangeForAxes[isSecondAxis ? "second" : "first"];
    const end = point.stackY || point.total;
    const start = end - point.y;
    const isWholeUnderMin: boolean = start <= axisRange.minAxisValue && end <= axisRange.minAxisValue;
    const isWholeAboveMax: boolean = start >= axisRange.maxAxisValue && end >= axisRange.maxAxisValue;
    if (isWholeUnderMin || isWholeAboveMax) {
        hideDataLabel(point);
    }
}

export const hideAllLabels = ({ series }: { series: Highcharts.Series[] }): void =>
    hideDataLabels(flatMap(series, (s) => s.points));

export const showAllLabels = ({ series }: { series: Highcharts.Series[] }): void =>
    showDataLabels(flatMap(series, (s) => s.points));

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getDataLabelAttributes(point: any): IRectBySize {
    const dataLabel = get(point, "dataLabel", null);
    const parentGroup = get(point, "dataLabel.parentGroup", null);

    const labelSafeOffset = -100; // labels outside axis range have typically -9999, hide them
    const labelVisible = dataLabel && dataLabel.x > labelSafeOffset && dataLabel.y > labelSafeOffset;

    if (dataLabel && parentGroup && labelVisible) {
        return {
            x: dataLabel.x + parentGroup.translateX,
            y: dataLabel.y + parentGroup.translateY,
            width: dataLabel.width,
            height: dataLabel.height,
        };
    }

    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function intersectsParentLabel(point: any, points: any[]): boolean {
    const pointParent = parseInt(point.parent, 10);
    // Highchart 7 doesn't render dataLabel at points which have null value
    const pointLabelShape = point.dataLabel;
    if (isNaN(pointParent) || !pointLabelShape) {
        return false;
    }

    const parentPoint = points[pointParent];
    const parentLabelShape = parentPoint.dataLabel;
    return isIntersecting(pointLabelShape, parentLabelShape);
}

function isTruncatedByMin(shape: any, chart: any) {
    return shape.y + shape.height > chart.clipBox.height;
}

function isTruncatedByMax(shape: any) {
    return shape.y < 0;
}

// works for both column/bar chart thanks bar's 90deg rotation
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getShapeVisiblePart(shape: any, chart: any, wholeSize: number): number {
    if (isTruncatedByMax(shape)) {
        return shape.y + shape.height;
    } else if (isTruncatedByMin(shape, chart)) {
        return chart.clipBox.height - shape.y;
    }

    return wholeSize;
}

export function getLabelStyle(type: string, stacking: string): Highcharts.CSSObject {
    if (isAreaChart(type)) {
        return BLACK_LABEL;
    }
    return stacking || isOneOfTypes(type, whiteDataLabelTypes) ? WHITE_LABEL : BLACK_LABEL;
}

/**
 * A callback function to format data label and `this` is required by Highchart
 * Ref: https://api.highcharts.com/highcharts/yAxis.labels.formatter
 */
export function formatAsPercent(unit: number = 100): string {
    const val = parseFloat((this.value * unit).toPrecision(14));
    return `${val}%`;
}

export function isInPercent(format: string = ""): boolean {
    return format.includes("%");
}

export function getLabelsVisibilityConfig(visible: IDataLabelsVisible): Highcharts.DataLabelsOptions {
    switch (visible) {
        case "auto":
            return {
                enabled: true,
                allowOverlap: false,
            };
        case true:
            return {
                enabled: true,
                allowOverlap: true,
            };
        case false:
            return {
                enabled: false,
            };
        default:
            // keep decision on each chart for `undefined`
            return {};
    }
}
