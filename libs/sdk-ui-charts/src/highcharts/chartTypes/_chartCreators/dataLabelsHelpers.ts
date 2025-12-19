// (C) 2007-2025 GoodData Corporation

import { type ITheme } from "@gooddata/sdk-model";

import {
    type IAxisRange,
    type IAxisRangeForAxes,
    type IRectBySize,
    isIntersecting,
    isStacked,
    pointInRange,
} from "./helpers.js";
import { type IChartConfig, type IDataLabelsVisible } from "../../../interfaces/index.js";
import {
    DATA_LABEL_C6,
    getBackplateLabelStyle,
    getBackplateLabelStyling,
    getBlackLabelStyle,
    getWhiteLabelStyle,
    whiteDataLabelTypes,
} from "../../constants/label.js";
import { type StackingType } from "../../constants/stacking.js";
import { type DataLabelsOptions } from "../../lib/index.js";
import { isAreaChart, isBarChart, isColumnChart, isDependencyWheel, isOneOfTypes } from "../_util/common.js";

export function isLabelOverlappingItsShape({ dataLabel, shapeArgs }: any): boolean {
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
    (chart?.options?.plotOptions as any)?.gdcOptions?.dataLabels?.visible ?? "auto";

export const getDataLabelsGdcTotalsVisible = (chart: Highcharts.Chart): boolean | string =>
    (chart?.options?.plotOptions as any)?.gdcOptions?.dataLabels?.totalsVisible ?? "auto";

const isLabelsStackedFromYAxis = (chart: Highcharts.Chart): boolean => {
    const yAxis = chart?.userOptions?.yAxis;

    if (yAxis && Array.isArray(yAxis)) {
        return (yAxis[0]?.stackLabels?.enabled ?? false) || (yAxis[1]?.stackLabels?.enabled ?? false);
    }

    return false;
};

export const areLabelsStacked = (chart: Highcharts.Chart): boolean =>
    isLabelsStackedFromYAxis(chart) && isStacked(chart);

export const hasDataLabel = (point: any): boolean => !!point.dataLabel;

export const hasShape = (point: any): boolean => !!point.shapeArgs;

export const hasLabelInside = (point: any): boolean => {
    const verticalAlign = point?.dataLabel?.alignOptions?.verticalAlign ?? "";
    return verticalAlign === "middle";
};

export const minimizeDataLabel = (point: any): void => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.width = 0;
        dataLabel.height = 0;
    }
};

export const hideDataLabel = (point: any): void => {
    const { dataLabel } = point;
    if (dataLabel) {
        // after migration to highcharts 10.2.0, the dataLabel.hide() is not working for treemap charts
        // we let it here for backward compatibility and also try to hide it directly in style
        dataLabel.hide();
    }

    if (dataLabel?.element) {
        dataLabel.attr({ visibility: "hidden" });
        // Optionally, also set style:
        if (dataLabel.element.style) {
            dataLabel.element.style.visibility = "hidden";
            dataLabel.element.style.display = "none";
        }
    }
};

export const showDataLabel = (point: any): void => {
    const { dataLabel } = point;

    if (dataLabel) {
        // after migration to highcharts 10.2.0, the dataLabel.show() is not working for treemap charts
        // we let it here for backward compatibility and also try to show it directly in style
        dataLabel.show();
    }

    if (dataLabel?.element) {
        dataLabel.attr({ visibility: "visible" });
        if (dataLabel.element.style) {
            dataLabel.element.style.visibility = "visible";
            dataLabel.element.style.display = "";
        }
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
    point: Highcharts.Point,
    value: number | undefined,
    axisRangeForAxes: IAxisRangeForAxes,
    isVisibleInZoomedAxis: boolean,
): void {
    const isSecondAxis = point?.series?.yAxis?.options?.opposite ?? false;
    const axisRange: IAxisRange | undefined = axisRangeForAxes[isSecondAxis ? "second" : "first"];
    const isInsideAxisRange = pointInRange(value, axisRange);
    if (!isInsideAxisRange || !isVisibleInZoomedAxis) {
        hideDataLabel(point);
    } else {
        showDataLabel(point);
    }
}

export function showStackLabelInAxisRange(
    point: Highcharts.Point,
    axisRangeForAxes: IAxisRangeForAxes,
    isVisibleInZoomedAxis: boolean,
): void {
    const isSecondAxis = point.series?.yAxis?.options?.opposite ?? false;
    const axisRange: IAxisRange | undefined = axisRangeForAxes[isSecondAxis ? "second" : "first"];
    const end = (point as any).stackY || point.total;
    const start = end - point.y!;
    const isWholeUnderMin: boolean = start <= axisRange!.minAxisValue && end <= axisRange!.minAxisValue;
    const isWholeAboveMax: boolean = start >= axisRange!.maxAxisValue && end >= axisRange!.maxAxisValue;
    if (isWholeUnderMin || isWholeAboveMax || !isVisibleInZoomedAxis) {
        hideDataLabel(point);
    }
}

export const hideAllLabels = ({ series }: { series: Highcharts.Series[] }): void =>
    hideDataLabels(series.flatMap((s) => s.points));

export const showAllLabels = ({ series }: { series: Highcharts.Series[] }): void =>
    showDataLabels(series.flatMap((s) => s.points));

export function setStackVisibilityByOpacity(stackTotalGroup: Highcharts.SVGAttributes, visible: boolean) {
    stackTotalGroup["attr"]({ opacity: visible ? 1 : 0 });
}

export function getDataLabelAttributes(point: any): IRectBySize {
    const dataLabel = point?.dataLabel ?? null;
    const parentGroup = point?.dataLabel?.parentGroup ?? null;

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

export function getShapeVisiblePart(shape: any, chart: any, wholeSize: number): number {
    if (isTruncatedByMax(shape)) {
        return shape.y + shape.height;
    } else if (isTruncatedByMin(shape, chart)) {
        return chart.clipBox.height - shape.y;
    }

    return wholeSize;
}

export function getLabelStyle(
    type: string | undefined,
    stacking: StackingType | undefined,
    theme?: ITheme,
    isBackplateStyle: boolean = false,
): Highcharts.CSSObject {
    if (isDependencyWheel(type)) {
        return {
            ...DATA_LABEL_C6,
            fontWeight: "400",
        };
    }

    if (isBackplateStyle) {
        return {
            ...getBackplateLabelStyle(theme),
            fontWeight: "400",
        };
    }

    if (isAreaChart(type)) {
        return getBlackLabelStyle(theme);
    }

    return stacking || isOneOfTypes(type, whiteDataLabelTypes)
        ? getWhiteLabelStyle(theme)
        : getBlackLabelStyle(theme);
}

export function getLabelsStyling(
    type: string | undefined,
    stacking: StackingType | undefined,
    theme?: ITheme,
    isBackplateStyle: boolean = false,
): Highcharts.DataLabelsOptions {
    if (isBackplateStyle) {
        return getBackplateLabelStyling(theme);
    }

    return {
        style: getLabelStyle(type, stacking, theme, isBackplateStyle),
    };
}

/**
 * A callback function to format data label and `this` is required by Highchart
 * Ref: https://api.highcharts.com/highcharts/yAxis.labels.formatter
 */
export function formatAsPercent(this: any, unit: number = 100): string {
    const val = parseFloat((this.value * unit).toPrecision(14));
    return `${val}%`;
}

export function isInPercent(format: string = ""): boolean {
    return format.includes("%");
}

// returns totalVisible based on the current conditions
// it returns auto in case of missing chartConfig and not being requested in context of barchart
export function getTotalsVisibility(chartConfig?: IChartConfig): IDataLabelsVisible | undefined {
    const totalsVisibility = chartConfig?.dataLabels?.totalsVisible;

    if (!(totalsVisibility === null || totalsVisibility === undefined)) {
        return totalsVisibility;
    }

    return chartConfig?.dataLabels?.visible;
}

export function getTotalsVisibilityConfig(type: string | undefined, chartConfig?: IChartConfig) {
    if (!(isColumnChart(type) || isBarChart(type))) {
        return {};
    }

    const totalsVisible = chartConfig?.dataLabels?.totalsVisible;

    // it configures logic for previous barchart generation without total labels
    if (
        isBarChart(type) &&
        (!totalsVisible || totalsVisible === null || totalsVisible === undefined) &&
        !chartConfig?.enableSeparateTotalLabels
    ) {
        return { enabled: false };
    }

    const defaultTotalsVisibility =
        chartConfig?.dataLabels?.visible === null || chartConfig?.dataLabels?.visible === undefined
            ? "auto"
            : chartConfig?.dataLabels?.visible;

    return getLabelsVisibilityConfig(
        totalsVisible === null || totalsVisible === undefined ? defaultTotalsVisibility : totalsVisible,
    );
}

export function getLabelsVisibilityConfig(visible: IDataLabelsVisible | undefined): DataLabelsOptions {
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
