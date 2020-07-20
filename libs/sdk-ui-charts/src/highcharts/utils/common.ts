// (C) 2007-2020 GoodData Corporation
import clone from "lodash/clone";
import get from "lodash/get";
import includes from "lodash/includes";
import isNil from "lodash/isNil";
import setWith from "lodash/setWith";
import { numberFormat } from "@gooddata/numberjs";
import escape from "lodash/escape";
import unescape from "lodash/unescape";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { IChartOptions, ISeriesItem } from "../typings/unsafe";

// lodash/fp does not provide typings
// https://stackoverflow.com/questions/38020019/where-can-i-find-typescript-typings-for-lodash-fp
/* tslint:disable */
const isEqual = require("lodash/fp/isEqual");
/* tslint:enable */

export function parseValue(value: string) {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? null : parsedValue;
}

export const immutableSet = (dataSet: any, path: any, newValue: any) =>
    setWith({ ...dataSet }, path, newValue, clone);

export const repeatItemsNTimes = (array: any[], n: number) =>
    new Array(n).fill(null).reduce((result) => [...result, ...array], []);

export const unEscapeAngleBrackets = (str: string) =>
    str && str.replace(/&lt;|&#60;/g, "<").replace(/&gt;|&#62;/g, ">");

export function isRotationInRange(rotation: number, min: number, max: number) {
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
export const isPieOrDonutChart = (type: string) => isPieChart(type) || isDonutChart(type);

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
export const isComboChart = (type: string) =>
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
 * @param type
 */
export const isInvertedChartType = (type: string) => isBarChart(type) || isBulletChart(type);
export const isChartSupported = (type: string) => includes(VisualizationTypes, type);
export const isOneOfTypes = (type: string, types: string[]) => includes(types, type);
export const stringifyChartTypes = () =>
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
    const series = get(chartOptions, "data.series", []);
    const targetSeries = series.find((item: ISeriesItem) => item.yAxis === 0);

    return get(targetSeries, "type", chartOptions.type);
};

export const unwrap = (wrappedObject: any) => {
    return wrappedObject[Object.keys(wrappedObject)[0]];
};

export function percentFormatter(value: number): string {
    return isNil(value) ? "" : `${parseFloat(value.toFixed(2))}%`;
}

export const isCssMultiLineTruncationSupported = (): boolean => {
    // support -webkit-line-clamp
    return "webkitLineClamp" in document.body.style;
};
export const customEscape = (str: string) => str && escape(unescape(str));
