// (C) 2007-2021 GoodData Corporation
import clone from "lodash/clone";
import includes from "lodash/includes";
import isNil from "lodash/isNil";
import setWith from "lodash/setWith";
import { numberFormat } from "@gooddata/numberjs";
import escape from "lodash/escape";
import isEqual from "lodash/fp/isEqual";
import unescape from "lodash/unescape";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { IChartOptions, ISeriesItem } from "../../typings/unsafe";
import { IChartConfig } from "../../../interfaces";

export function parseValue(value: string): number | null {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? null : parsedValue;
}

export const immutableSet = <T extends object, U>(
    dataSet: T,
    path: Parameters<typeof setWith>[1],
    newValue: U,
): T => setWith({ ...dataSet }, path, newValue, clone);

export const repeatItemsNTimes = <T>(array: T[], n: number): T[] =>
    new Array(n).fill(null).reduce((result) => [...result, ...array], []);

export const unEscapeAngleBrackets = (str: string): string =>
    str && str.replace(/&lt;|&#60;/g, "<").replace(/&gt;|&#62;/g, ">");

export function isRotationInRange(rotation: number, min: number, max: number): boolean {
    return rotation >= min && rotation <= max;
}

/**
 * @internal
 */
export const isColumnChart = isEqual(VisualizationTypes.COLUMN);

/**
 * @internal
 */
export const isBarChart = isEqual(VisualizationTypes.BAR);

/**
 * @internal
 */
export const isBulletChart = isEqual(VisualizationTypes.BULLET);

/**
 * @internal
 */
export const isLineChart = isEqual(VisualizationTypes.LINE);

/**
 * @internal
 */
export const isScatterPlot = isEqual(VisualizationTypes.SCATTER);

/**
 * @internal
 */
export const isPieChart = isEqual(VisualizationTypes.PIE);

/**
 * @internal
 */
export const isDonutChart = isEqual(VisualizationTypes.DONUT);

/**
 * @internal
 */
export const isPieOrDonutChart = (type: string): boolean => isPieChart(type) || isDonutChart(type);

/**
 * @internal
 */
export const isAreaChart = isEqual(VisualizationTypes.AREA);

/**
 * @internal
 */
export const isBubbleChart = isEqual(VisualizationTypes.BUBBLE);

/**
 * @internal
 */
export const isComboChart = (type: string): boolean =>
    isEqual(type, VisualizationTypes.COMBO) || isEqual(type, VisualizationTypes.COMBO2);

/**
 * @internal
 */
export const isTreemap = isEqual(VisualizationTypes.TREEMAP);

/**
 * @internal
 */
export const isHeatmap = isEqual(VisualizationTypes.HEATMAP);

/**
 * @internal
 */
export const isInvertedChartType = (type: string): boolean => isBarChart(type) || isBulletChart(type);
export const isChartSupported = (type: string): boolean => includes(VisualizationTypes, type);
export const isOneOfTypes = (type: string, types: string[]): boolean => includes(types, type);
export const stringifyChartTypes = (): string =>
    Object.keys(VisualizationTypes)
        .reduce((acc, type) => {
            acc.push(VisualizationTypes[type]);
            return acc;
        }, [])
        .join(", ");

export function formatLegendLabel(
    value: number,
    format: string,
    diff: number,
    numericSymbols: string[],
): string {
    if (format && format.includes("%")) {
        return numberFormat(value, "#,#0%");
    }

    const sign = Math.sign(value) === -1 ? "-" : "";
    const positiveValue = Math.abs(value);
    let formattingString = "";

    if (diff < 10) {
        formattingString += "[<1]0.00;[<10]#.#;[<100]#.#;";
    }

    const k =
        diff < 10000
            ? "[<999500]0;"
            : `[<1000]0;[<10000]#.#,${numericSymbols[0]};[<999500]#,${numericSymbols[0]};`;
    const m = `[<10000000]#.#,,${numericSymbols[1]};[<999500000]#,,${numericSymbols[1]};`;
    const b = `[<10000000000]#.#,,,${numericSymbols[2]};[<999500000000]#,,,${numericSymbols[2]};`;
    const t = `[<10000000000000]#.#,,,${numericSymbols[3]};[>=10000000000000]#,,,${numericSymbols[3]}`;
    formattingString += k + m + b + t;
    return sign + numberFormat(positiveValue, formattingString);
}

export const getPrimaryChartType = (chartOptions: IChartOptions): string => {
    const series = chartOptions?.data?.series ?? [];
    const targetSeries = series.find((item: ISeriesItem) => item.yAxis === 0);

    return targetSeries?.type ?? chartOptions.type;
};

export const unwrap = (wrappedObject: unknown): any => {
    return wrappedObject[Object.keys(wrappedObject)[0]];
};

export function percentFormatter(value: number): string {
    return isNil(value) ? "" : `${parseFloat(value.toFixed(2))}%`;
}

export const isCssMultiLineTruncationSupported = (): boolean => {
    // support -webkit-line-clamp
    return "webkitLineClamp" in document.body.style;
};
export const customEscape = (str: string): string => str && escape(unescape(str));

export const getAxesCounts = (config: IChartConfig): [number, number] => {
    const hasSecondaryXAxis = config.secondary_xaxis && config.secondary_xaxis?.measures?.length !== 0;
    const hasSecondaryYAxis = config.secondary_yaxis && config.secondary_yaxis?.measures?.length !== 0;
    return [hasSecondaryXAxis ? 2 : 1, hasSecondaryYAxis ? 2 : 1];
};
