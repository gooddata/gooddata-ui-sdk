// (C) 2007-2025 GoodData Corporation

import { compact, initial, isEmpty, max, maxBy, min, minBy, pick, tail, unzip, zip } from "lodash-es";

import { VisType, VisualizationTypes } from "@gooddata/sdk-ui";

import { ChartAlignTypes, IChartConfig } from "../../../interfaces/index.js";
import { BOTTOM, MIDDLE, TOP } from "../../constants/alignments.js";
import { ChartOptions, OptionsStackingValue, PlotOptions } from "../../lib/index.js";
import { IChartOptions, ISeriesDataItem, ISeriesItem, UnsafeInternals } from "../../typings/unsafe.js";
import { isInvertedChartType } from "../_util/common.js";

export interface IRectByPoints {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface IRectBySize {
    x: number;
    y: number;
    width: number;
    height: number;
    show?: () => void;
    hide?: () => void;
}

// https://silentmatt.com/rectangle-intersection/
export const rectanglesAreOverlapping = (
    r1: IRectByPoints,
    r2: IRectByPoints,
    padding: number = 0,
): boolean =>
    r1.left - padding < r2.right + padding &&
    r1.right + padding > r2.left - padding &&
    r1.top - padding < r2.bottom + padding &&
    r1.bottom + padding > r2.top - padding;

export const isIntersecting = (r1: IRectBySize, r2: IRectBySize): boolean =>
    r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;

export const toNeighbors = (array: any[]): any[] => zip(initial(array), tail(array));

export const getVisibleSeries = (chart: Highcharts.Chart): Highcharts.Series[] =>
    chart.series?.filter((s: Highcharts.Series) => s.visible);

export const getHiddenSeries = (chart: Highcharts.Chart): Highcharts.Series[] =>
    chart.series?.filter((s: Highcharts.Series) => !s.visible);

export const getDataPoints = (series: Highcharts.Series[]): Highcharts.Point[] =>
    compact(unzip(series.map((s: Highcharts.Series) => s.points)).flat());

export const getDataPointsOfVisibleSeries = (chart: Highcharts.Chart): Highcharts.Point[] =>
    getDataPoints(getVisibleSeries(chart));

export const getChartType = (chart: Highcharts.Chart): string | undefined => chart.options.chart?.type;
export const isStacked = (chart: Highcharts.Chart): boolean => {
    const chartType = getChartType(chart) as keyof PlotOptions;

    const chartTypeOptions = chart.userOptions?.plotOptions?.[chartType] as {
        stacking?: OptionsStackingValue;
    };
    const isStackedByChartType = !!chartTypeOptions?.stacking;
    const isStackedBySeries = !!chart.userOptions?.plotOptions?.series?.stacking;
    const hasStackedAxis = chart.axes.some((axis: any) => !isEmpty(axis?.stacking?.stacks));

    return (isStackedByChartType || isStackedBySeries) && hasStackedAxis;
};

export function getChartProperties(config: IChartConfig, type: VisType): any {
    const isInvertedType = isInvertedChartType(type, config?.orientation?.position);
    const chartProps: any = {
        xAxisProps: isInvertedType ? { ...config.yaxis } : { ...config.xaxis },
        yAxisProps: isInvertedType ? { ...config.xaxis } : { ...config.yaxis },
    };

    const secondaryXAxisProps = isInvertedType
        ? { ...config.secondary_yaxis }
        : { ...config.secondary_xaxis };
    const secondaryYAxisProps = isInvertedType
        ? { ...config.secondary_xaxis }
        : { ...config.secondary_yaxis };

    if (!isEmpty(secondaryXAxisProps)) {
        chartProps.secondary_xAxisProps = secondaryXAxisProps;
    }
    if (!isEmpty(secondaryYAxisProps)) {
        chartProps.secondary_yAxisProps = secondaryYAxisProps;
    }

    return chartProps;
}

export const getPointPositions = (
    point: any,
): {
    shape: DOMRect;
    label: DOMRect;
    labelPadding: any;
    show: () => void;
    hide: () => void;
} => {
    const { dataLabel, graphic } = point;
    const labelRect = dataLabel.element.getBoundingClientRect();
    const shapeRect = graphic.element.getBoundingClientRect();
    return {
        shape: shapeRect,
        label: labelRect,
        labelPadding: dataLabel.padding,
        show: () => dataLabel.show(),
        hide: () => dataLabel.hide(),
    };
};

export function getShapeAttributes(point: any): IRectBySize {
    const { series, shapeArgs } = point;
    const { plotSizeX, plotSizeY, options } = series.chart;

    if (options.chart.type === VisualizationTypes.BAR) {
        return {
            x: Math.floor(plotSizeY - (shapeArgs.y - series.group.translateX) - shapeArgs.height),
            y: Math.ceil(plotSizeX + series.group.translateY - shapeArgs.x - shapeArgs.width),
            width: shapeArgs.height,
            height: shapeArgs.width,
        };
    } else if (
        options.chart.type === VisualizationTypes.COLUMN ||
        options.chart.type === VisualizationTypes.WATERFALL
    ) {
        return {
            x: shapeArgs.x + series.group.translateX,
            y: shapeArgs.y + series.group.translateY,
            width: shapeArgs.width,
            height: shapeArgs.height,
        };
    }

    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };
}

function getExtremeOnAxis(min: number, max: number) {
    const axisMin = min >= 0 ? 0 : min;
    const axisMax = max < 0 ? 0 : max;

    return { axisMin, axisMax };
}

export function shouldFollowPointerForDualAxes(chartOptions: IChartOptions): boolean {
    const yAxes = chartOptions?.yAxes ?? [];
    if (yAxes.length <= 1) {
        return false;
    }

    const hasMinMaxValue = [
        chartOptions?.yAxisProps?.min,
        chartOptions?.yAxisProps?.max,
        chartOptions?.secondary_yAxisProps?.min,
        chartOptions?.secondary_yAxisProps?.max,
    ].some((item) => !isEmpty(item));

    return yAxes.length > 1 && hasMinMaxValue;
}

function isMinMaxLimitData(chartOptions: IChartOptions, key: "yAxisProps" | "secondary_yAxisProps") {
    const yMin = parseFloat(chartOptions?.[key]?.min ?? "");
    const yMax = parseFloat(chartOptions?.[key]?.max ?? "");
    if (isNaN(yMin) && isNaN(yMax)) {
        return false;
    }

    const { minDataValue, maxDataValue } = getDataExtremeDataValues(chartOptions);
    const { axisMin, axisMax } = getExtremeOnAxis(minDataValue, maxDataValue);

    return (!isNaN(yMax) && axisMax > yMax) || (!isNaN(yMin) && axisMin < yMin);
}

export function shouldFollowPointer(chartOptions: IChartOptions): boolean {
    if (shouldFollowPointerForDualAxes(chartOptions)) {
        return true;
    }
    return (
        isMinMaxLimitData(chartOptions, "yAxisProps") ||
        isMinMaxLimitData(chartOptions, "secondary_yAxisProps")
    );
}

function isSerieVisible(serie: ISeriesItem): boolean {
    return serie.visible === undefined || serie.visible;
}

function getNonStackedMaxValue(series: ISeriesItem[]): number {
    return series.reduce((maxValue: number, serie: ISeriesItem) => {
        if (isSerieVisible(serie)) {
            const maxSerieValue = getSerieMaxDataValue(serie.data);

            return maxValue > maxSerieValue ? maxValue : maxSerieValue;
        }
        return maxValue;
    }, Number.MIN_SAFE_INTEGER);
}

function getNonStackedMinValue(series: ISeriesItem[]): number {
    return series.reduce((minValue: number, serie: ISeriesItem) => {
        if (isSerieVisible(serie)) {
            const minSerieValue = getSerieMinDataValue(serie.data);

            return minValue < minSerieValue ? minValue : minSerieValue;
        }
        return minValue;
    }, Number.MAX_SAFE_INTEGER);
}

function getDataExtremeDataValues(chartOptions: IChartOptions) {
    const series = chartOptions?.data?.series;

    const maxDataValue = chartOptions.hasStackByAttribute
        ? getStackedMaxValue(series)
        : getNonStackedMaxValue(series);

    const minDataValue = chartOptions.hasStackByAttribute
        ? getStackedMinValue(series)
        : getNonStackedMinValue(series);

    return { minDataValue, maxDataValue };
}

function getSerieMaxDataValue(serieData: ISeriesDataItem[]): number {
    const max = maxBy(serieData, (item: ISeriesDataItem) => (item?.y ? item.y : null));
    return max ? max.y : Number.MIN_SAFE_INTEGER;
}

function getSerieMinDataValue(serieData: ISeriesDataItem[]): number {
    const min = minBy(serieData, (item: ISeriesDataItem) => (item?.y ? item.y : null));
    return min ? min.y : Number.MAX_SAFE_INTEGER;
}

export function getStackedMaxValue(series: ISeriesItem[]): number {
    const maximumPerColumn = getColumnExtremeValue(series, getMaxFromPositiveNegativeStacks);

    const maxValue = max(maximumPerColumn);
    return maxValue === null || maxValue === undefined ? Number.MIN_SAFE_INTEGER : maxValue;
}

export function getStackedMinValue(series: ISeriesItem[]): number {
    const minimumPerColumn = getColumnExtremeValue(series, getMinFromPositiveNegativeStacks);

    const minValue = min(minimumPerColumn);
    return minValue === null || minValue === undefined ? Number.MAX_SAFE_INTEGER : minValue;
}

function getColumnExtremeValue(
    series: ISeriesItem[],
    extremeColumnGetter: (data: number[]) => number,
): number[] {
    const seriesDataPerColumn = zip(...series.filter(isSerieVisible).map((serie) => serie.data));

    const seriesDataYValue = seriesDataPerColumn.map((data) => data.map((x) => x.y));
    return seriesDataYValue.map(extremeColumnGetter);
}

function getMaxFromPositiveNegativeStacks(data: number[]): number {
    return data.reduce((acc: number, current: number) => {
        if (current === null || current === undefined) {
            return acc;
        }

        if (current < 0 || acc < 0) {
            return Math.max(acc, current);
        }

        return acc + current;
    }, Number.MIN_SAFE_INTEGER);
}

function getMinFromPositiveNegativeStacks(data: number[]): number {
    return data.reduce((acc: number, current: number) => {
        if (current === null || current === undefined) {
            return acc;
        }

        if (current > 0 || acc > 0) {
            return Math.min(acc, current);
        }

        return acc + current;
    }, Number.MAX_SAFE_INTEGER);
}

export function shouldStartOnTick(
    chartOptions: IChartOptions,
    axisPropsKey: "yAxisProps" | "secondary_yAxisProps" = "yAxisProps",
): boolean {
    const min = parseFloat(chartOptions?.[axisPropsKey]?.min ?? "");
    const max = parseFloat(chartOptions?.[axisPropsKey]?.max ?? "");

    if (isNaN(min) && isNaN(max)) {
        return true;
    }

    if (!isNaN(min) && !isNaN(max)) {
        return min > max;
    }

    const series = chartOptions?.data?.series;
    const minDataValue = chartOptions.hasStackByAttribute
        ? getStackedMinValue(series)
        : getNonStackedMinValue(series);

    return !isNaN(max) && max <= minDataValue;
}
export function shouldEndOnTick(
    chartOptions: IChartOptions,
    axisPropsKey: "yAxisProps" | "secondary_yAxisProps" = "yAxisProps",
): boolean {
    const min = parseFloat(chartOptions?.[axisPropsKey]?.min ?? "");
    const max = parseFloat(chartOptions?.[axisPropsKey]?.max ?? "");

    if (isNaN(min) && isNaN(max)) {
        return true;
    }

    if (!isNaN(min) && !isNaN(max)) {
        return min > max;
    }

    const series = chartOptions?.data?.series;
    const maxDataValue = chartOptions.hasStackByAttribute
        ? getStackedMaxValue(series)
        : getNonStackedMaxValue(series);

    return !isNaN(min) && min >= maxDataValue;
}

export function shouldXAxisStartOnTickOnBubbleScatter(chartOptions: IChartOptions): boolean {
    const min = parseFloat(chartOptions?.xAxisProps?.min ?? "");

    return isNaN(min);
}

export function shouldYAxisStartOnTickOnBubbleScatter(chartOptions: IChartOptions): boolean {
    const min = parseFloat(chartOptions?.yAxisProps?.min ?? "");

    const series = chartOptions?.data?.series;
    const maxDataValue = getNonStackedMaxValue(series);

    return isNaN(min) || min > maxDataValue;
}

export interface IAxisRange {
    minAxisValue: number;
    maxAxisValue: number;
}

export interface IAxisRangeForAxes {
    first?: IAxisRange;
    second?: IAxisRange;
}

export function getAxisRangeForAxes(chart: Highcharts.Chart): IAxisRangeForAxes {
    const yAxis: Highcharts.Axis[] = chart.yAxis;

    // note: accessing 'opposite' prop which is not part of the public API; min & max is
    return yAxis
        .map((axis: UnsafeInternals) => pick(axis, ["opposite", "min", "max"]))
        .map(({ opposite, min, max }: any) => ({ axis: opposite ? "second" : "first", min, max }))
        .reduce(
            (
                result: Record<string, { minAxisValue: number; maxAxisValue: number }>,
                { axis, min, max }: { axis: string; min: number; max: number },
            ) => {
                result[axis] = {
                    minAxisValue: min,
                    maxAxisValue: max,
                };
                return result;
            },
            {},
        );
}

export function pointInRange(pointValue: number, axisRange: IAxisRange): boolean {
    return axisRange.minAxisValue <= pointValue && pointValue <= axisRange.maxAxisValue;
}

export function alignChart(chart: Highcharts.Chart, verticalAlign: ChartAlignTypes = "middle"): void {
    const { container } = chart;
    if (!container) {
        return;
    }

    const { width: chartWidth, height: chartHeight } = container.getBoundingClientRect();
    const margin: number = chartHeight - chartWidth;

    const isVerticalRectContainer: boolean = margin > 0;

    const isAlignedToTop = verticalAlign === TOP;
    const isAlignedToBottom = verticalAlign === BOTTOM;

    const type = getChartType(chart);
    const className = `s-highcharts-${type}-aligned-to-${verticalAlign}`;

    let chartOptions: ChartOptions = {};
    if (isVerticalRectContainer && verticalAlign !== MIDDLE) {
        chartOptions = {
            spacingTop: isAlignedToTop ? 0 : undefined,
            spacingBottom: isAlignedToBottom ? 0 : undefined,
            marginTop: isAlignedToBottom ? margin : undefined,
            marginBottom: isAlignedToTop ? margin : undefined,
            className,
        };
    } else {
        chartOptions = {
            spacingTop: undefined,
            spacingBottom: undefined,
            marginTop: undefined,
            marginBottom: undefined,
            className,
        };
    }

    chart.update(
        {
            chart: chartOptions,
        },
        false,
        false,
        false,
    );
}

// used to get all axes from charts like heatmap, treemap, bubble ( = space filling charts)
export function getAxesWithCategoriesFromSpaceFillingChart(chart: Highcharts.Chart): Highcharts.Axis[] {
    return chart.axes.filter((axis: Highcharts.Axis) => axis.categories?.length > 0);
}

export function getAxisWithCategories(chart: Highcharts.Chart): Highcharts.Axis | undefined {
    return chart.xAxis.find((axis: Highcharts.Axis) => axis.categories?.length > 0);
}

export function getPointsVisibleInAxisRange(
    points: Highcharts.Point[],
    axis: Highcharts.Axis | undefined,
): Highcharts.Point[] {
    if (!axis) {
        return points;
    }
    return points.filter((point) => isPointVisibleInAxisRange(point, axis));
}

export function isPointVisibleInAxisRange(
    point: Highcharts.Point,
    axis: Highcharts.Axis | undefined,
): boolean {
    if (!axis) {
        return true;
    }
    const { min, max } = axis.getExtremes();
    return point.x >= min && point.x <= Math.round(max);
}

export function getPointsVisibleInAxesRanges(
    points: Highcharts.Point[],
    axes: Highcharts.Axis[],
): Highcharts.Point[] {
    return points.filter((point) => isPointVisibleInAxesRanges(point, axes));
}

function isInsideXAxisRange(point: Highcharts.Point, axis: Highcharts.Axis): boolean {
    const { min, max } = axis.getExtremes();
    return point.x >= min && point.x <= Math.round(max);
}

function isInsideYAxisRange(point: Highcharts.Point, axis: Highcharts.Axis): boolean {
    const { min, max } = axis.getExtremes();
    return point.y !== undefined && point.y >= min && point.y <= Math.round(max);
}

export function isPointVisibleInAxesRanges(point: Highcharts.Point, axes: Highcharts.Axis[]): boolean {
    const xAxis = axes.find((axis) => axis.isXAxis);
    const yAxis = axes.find((axis) => !axis.isXAxis);

    if (xAxis && yAxis) {
        return isInsideXAxisRange(point, xAxis) && isInsideYAxisRange(point, yAxis);
    }

    if (!yAxis && xAxis) {
        return isInsideXAxisRange(point, xAxis);
    }

    if (!xAxis && yAxis) {
        return isInsideYAxisRange(point, yAxis);
    }
    return true;
}
