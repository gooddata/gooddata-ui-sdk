// (C) 2007-2025 GoodData Corporation

import { clone, escape, isEqual, setWith, unescape } from "lodash-es";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { DataValue } from "@gooddata/sdk-model";
import { VisualizationTypes } from "@gooddata/sdk-ui";

import { ChartOrientationType, IChartConfig } from "../../../interfaces/index.js";
import { DEFAULT_DECIMAL_SEPARATOR } from "../../constants/format.js";
import { IChartOptions, ISeriesItem } from "../../typings/unsafe.js";

export function parseValue(value: DataValue): number | null {
    if (typeof value === "string") {
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? null : parsedValue;
    }
    return typeof value === "number" ? value : null;
}

export const immutableSet = <T extends object, U>(
    dataSet: T,
    path: Parameters<typeof setWith>[1],
    newValue: U,
): T => setWith({ ...dataSet }, path, newValue, clone);

export const repeatItemsNTimes = <T>(array: T[], n: number): T[] =>
    new Array(n).fill(null).reduce((result: T[]) => {
        result.push(...array);
        return result;
    }, []);

export const unEscapeAngleBrackets = (str: string): string =>
    str?.replace(/&lt;|&#60;/g, "<").replace(/&gt;|&#62;/g, ">");

export function isRotationInRange(rotation: number, min: number, max: number): boolean {
    return rotation >= min && rotation <= max;
}

/**
 * @internal
 */
export const isColumnChart = (type: string) => isEqual(type, VisualizationTypes.COLUMN);

/**
 * @internal
 */
export const isBarChart = (type: string) => isEqual(type, VisualizationTypes.BAR);

/**
 * @internal
 */
export const isBulletChart = (type: string) => isEqual(type, VisualizationTypes.BULLET);

/**
 * @internal
 */
export const isLineChart = (type: string) => isEqual(type, VisualizationTypes.LINE);

/**
 * @internal
 */
export const isScatterPlot = (type: string) => isEqual(type, VisualizationTypes.SCATTER);

/**
 * @internal
 */
export const isPieChart = (type: string) => isEqual(type, VisualizationTypes.PIE);

/**
 * @internal
 */
export const isDonutChart = (type: string) => isEqual(type, VisualizationTypes.DONUT);

/**
 * @internal
 */
export const isPieOrDonutChart = (type: string): boolean => isPieChart(type) || isDonutChart(type);

/**
 * @internal
 */
export const isAreaChart = (type: string) => isEqual(type, VisualizationTypes.AREA);

/**
 * @internal
 */
export const isBubbleChart = (type: string) => isEqual(type, VisualizationTypes.BUBBLE);

/**
 * @internal
 */
export const isComboChart = (type: string): boolean =>
    isEqual(type, VisualizationTypes.COMBO) || isEqual(type, VisualizationTypes.COMBO2);

/**
 * @internal
 */
export const isTreemap = (type: string) => isEqual(type, VisualizationTypes.TREEMAP);

/**
 * @internal
 */
export const isHeatmap = (type: string) => isEqual(type, VisualizationTypes.HEATMAP);

/**
 * @internal
 */
export const isFunnel = (type: string) => isEqual(type, VisualizationTypes.FUNNEL);

/**
 * @internal
 */
export const isPyramid = (type: string) => isEqual(type, VisualizationTypes.PYRAMID);

/**
 * @internal
 */
export const isSankey = (type: string) => isEqual(type, VisualizationTypes.SANKEY);

/**
 * @internal
 */
export const isDependencyWheel = (type: string) => isEqual(type, VisualizationTypes.DEPENDENCY_WHEEL);

/**
 * @internal
 */
export const isSankeyOrDependencyWheel = (type: string): boolean => isSankey(type) || isDependencyWheel(type);

/**
 * @internal
 */
export const isWaterfall = (type: string) => isEqual(type, VisualizationTypes.WATERFALL);

/**
 * @internal
 */
export const isSupportingJoinedAttributeAxisName = (type: string): boolean =>
    isBarChart(type) || isColumnChart(type) || isBulletChart(type);

/**
 * @internal
 */
export const isInvertedChartType = (type: string, orientationPosition?: ChartOrientationType): boolean =>
    isBarChart(type) || isBulletChart(type) || (isWaterfall(type) && orientationPosition === "vertical");
export const isChartSupported = (type: string): boolean =>
    Object.values<string>(VisualizationTypes).includes(type);
export const isOneOfTypes = (type: string, types: string[]): boolean => types.includes(type);
export const stringifyChartTypes = (): string => Object.values(VisualizationTypes).join(", ");

export function formatLegendLabel(
    value: number,
    format: string,
    diff: number,
    numericSymbols: string[],
): string {
    if (format?.includes("%")) {
        return ClientFormatterFacade.formatValue(value, "#,#0%", undefined).formattedValue;
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

    const formatted = ClientFormatterFacade.formatValue(
        positiveValue,
        formattingString,
        undefined,
    ).formattedValue;

    return sign + formatted;
}

export const getPrimaryChartType = (chartOptions: IChartOptions): string => {
    const series = chartOptions?.data?.series ?? [];
    const targetSeries = series.find((item: ISeriesItem) => item.yAxis === 0);

    return targetSeries?.type ?? chartOptions.type;
};

export const unwrap = (wrappedObject: any): any => {
    return wrappedObject[Object.keys(wrappedObject)[0]];
};

const getNumberWithGivenDecimals = (value: number, decimalNumbers: number) =>
    decimalNumbers === 0 ? `${Math.round(value)}%` : `${parseFloat(value.toFixed(decimalNumbers))}%`;

// it calculates number of decimals from default format that contains ',' and '.' as separators
const getNumberOfDecimalsFromDefaultFormat = (format: string): number => {
    const splittedFormat = format.split(DEFAULT_DECIMAL_SEPARATOR);

    if (splittedFormat.length !== 2) {
        return 0;
    }

    return Array.from(splittedFormat[1]).reduce(
        (numberOfDecimals, letter) => (letter === "0" ? numberOfDecimals + 1 : numberOfDecimals),
        0,
    );
};

export function percentFormatter(value: number, format?: string): string {
    if (value === null || value === undefined) {
        return "";
    }

    const isPercentageFormat = format && format.trim().slice(-1) === "%";
    const numberOfDecimals = isPercentageFormat ? getNumberOfDecimalsFromDefaultFormat(format) : 2;

    return getNumberWithGivenDecimals(value, numberOfDecimals);
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
