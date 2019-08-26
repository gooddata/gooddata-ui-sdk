// (C) 2007-2018 GoodData Corporation
import setWith = require("lodash/setWith");
import clone = require("lodash/clone");
import get = require("lodash/get");
import includes = require("lodash/includes");
import { Observable } from "rxjs/Rx";
import { numberFormat } from "@gooddata/numberjs";

import { VisualizationTypes } from "../../../constants/visualizationTypes";
import { IAxis, ISeriesItem, IChartOptions } from "../../../interfaces/Config";
import { IHighchartsAxisExtend } from "../../../interfaces/HighchartsExtend";

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
    new Array(n).fill(null).reduce(result => [...result, ...array], []);

export function subscribeEvent(event: any, debounce: any, func: any, target: any = window): any {
    if (debounce > 0) {
        return Observable.fromEvent(target, event)
            .debounceTime(debounce)
            .subscribe(func);
    }

    return Observable.fromEvent(target, event).subscribe(func);
}

export function subscribeEvents(func: any, events: any[], target: any = window) {
    return events.map((event: any) => {
        return subscribeEvent(event.name, event.debounce, func, target);
    });
}

export const unEscapeAngleBrackets = (str: string) =>
    str && str.replace(/&lt;|&#60;/g, "<").replace(/&gt;|&#62;/g, ">");

export function getAttributeElementIdFromAttributeElementUri(attributeElementUri: string) {
    const match = "/elements?id=";
    return attributeElementUri.slice(attributeElementUri.lastIndexOf(match) + match.length);
}

export function isRotationInRange(rotation: number, min: number, max: number) {
    return rotation >= min && rotation <= max;
}

export const isTable = isEqual(VisualizationTypes.TABLE);
export const isColumnChart = isEqual(VisualizationTypes.COLUMN);
export const isBarChart = isEqual(VisualizationTypes.BAR);
export const isLineChart = isEqual(VisualizationTypes.LINE);
export const isScatterPlot = isEqual(VisualizationTypes.SCATTER);
export const isPieChart = isEqual(VisualizationTypes.PIE);
export const isDonutChart = isEqual(VisualizationTypes.DONUT);
export const isPieOrDonutChart = (type: string) => isPieChart(type) || isDonutChart(type);
export const isAreaChart = isEqual(VisualizationTypes.AREA);
export const isBubbleChart = isEqual(VisualizationTypes.BUBBLE);
export const isHeadline = isEqual(VisualizationTypes.HEADLINE);
export const isComboChart = (type: string) =>
    isEqual(type, VisualizationTypes.COMBO) || isEqual(type, VisualizationTypes.COMBO2);
export const isTreemap = isEqual(VisualizationTypes.TREEMAP);
export const isFunnelChart = isEqual(VisualizationTypes.FUNNEL);
export const isHeatmap = isEqual(VisualizationTypes.HEATMAP);
export const isChartSupported = (type: string) => includes(VisualizationTypes, type);
export const isOneOfTypes = (type: string, types: string[]) => includes(types, type);
export const isPrimaryYAxis = (yAxis: IAxis | IHighchartsAxisExtend) => !yAxis.opposite;
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
