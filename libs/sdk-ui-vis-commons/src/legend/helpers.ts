// (C) 2007-2022 GoodData Corporation
import range from "lodash/range.js";
import head from "lodash/head.js";
import last from "lodash/last.js";
import inRange from "lodash/inRange.js";
import isEqual from "lodash/isEqual.js";
import { numberFormat } from "@gooddata/numberjs";
import { IColorLegendItem, IColorLegendSize } from "./types.js";
import { LEFT, RIGHT } from "./PositionTypes.js";
import { ITheme } from "@gooddata/sdk-model";
import { parseRGBString } from "../coloring/color.js";

export const RESPONSIVE_ITEM_MIN_WIDTH = 200;
export const RESPONSIVE_VISIBLE_ROWS = 2;
export const FLUID_PAGING_WIDTH = 30;
export const LEGEND_PADDING = 12;
export const ITEM_HEIGHT = 20;
export const SKIPPED_LABEL_TEXT = "...";
export const UTF_NON_BREAKING_SPACE = "\u00A0";
export const STATIC_PAGING_HEIGHT = 44;

export interface IColorLegendBox {
    class: string | null;
    key: string;
    style?: {
        backgroundColor: string;
        border: string;
    };
}

interface IColorLabelConfigItem {
    type: string;
    labelIndex?: number;
    style?: {
        width?: number;
        height?: number;
        lineHeight?: string;
        textAlign?: string;
    };
}

export interface IHeatmapLegendLabel {
    class?: string;
    key: string;
    label: string;
    style: object;
}

export interface IColorLegendConfig {
    boxes: IColorLegendBox[];
    classes: string[];
    labels: IHeatmapLegendLabel[];
    position: string;
}

function getEmptyBlock(style: any, index: number) {
    return {
        key: `empty-${index}`,
        label: UTF_NON_BREAKING_SPACE,
        style,
    };
}

function getLabelStyle(width: number, textAlign: string) {
    return { width, textAlign };
}

const ALEFT = "left";
const ARIGHT = "right";
const ACENTER = "center";
const DOTS_WIDTH = 10;

function getSkippedLabelBlock(index: number) {
    return {
        key: `dots-${index}`,
        label: SKIPPED_LABEL_TEXT,
        style: getLabelStyle(DOTS_WIDTH, ACENTER),
    };
}

const verticalHeatmapMiddleLabelStyle = { height: 30, textAlign: ALEFT, lineHeight: "30px" };

export const verticalHeatmapConfig: IColorLabelConfigItem[] = [
    { type: "label", labelIndex: 0, style: { height: 15, textAlign: ALEFT, lineHeight: "11px" } },
    { type: "label", labelIndex: 1, style: verticalHeatmapMiddleLabelStyle },
    { type: "label", labelIndex: 2, style: verticalHeatmapMiddleLabelStyle },
    { type: "label", labelIndex: 3, style: verticalHeatmapMiddleLabelStyle },
    { type: "label", labelIndex: 4, style: verticalHeatmapMiddleLabelStyle },
    { type: "label", labelIndex: 5, style: verticalHeatmapMiddleLabelStyle },
    { type: "label", labelIndex: 6, style: verticalHeatmapMiddleLabelStyle },
    { type: "label", labelIndex: 7, style: { height: 15, textAlign: ALEFT, lineHeight: "20px" } },
];

const defaultHeatmapLegendLabelStyle = { width: 40, textAlign: ACENTER };

export const heatmapLegendConfigMatrix: IColorLabelConfigItem[][] = [
    [
        { type: "label", labelIndex: 0, style: { width: 175, textAlign: ALEFT } },
        { type: "label", labelIndex: 7, style: { width: 175, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 145, textAlign: ALEFT } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "label", labelIndex: 7, style: { width: 145, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 95, textAlign: ALEFT } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "label", labelIndex: 7, style: { width: 95, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 55, textAlign: ALEFT } },
        { type: "label", labelIndex: 2, style: { width: 90, textAlign: ACENTER } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "label", labelIndex: 5, style: { width: 90, textAlign: ACENTER } },
        { type: "label", labelIndex: 7, style: { width: 55, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 45, textAlign: ALEFT } },
        { type: "dots" },
        { type: "label", labelIndex: 2, style: { width: 90, textAlign: ACENTER } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "label", labelIndex: 5, style: { width: 90, textAlign: ACENTER } },
        { type: "dots" },
        { type: "label", labelIndex: 7, style: { width: 45, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 30, textAlign: ALEFT } },
        { type: "label", labelIndex: 1, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 2, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 3, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 4, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 5, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 6, style: defaultHeatmapLegendLabelStyle },
        { type: "label", labelIndex: 7, style: { width: 30, textAlign: ARIGHT } },
    ],
];

const colorLegendConfigMatrix: IColorLabelConfigItem[][] = [
    [
        { type: "label", labelIndex: 0, style: { width: 175, textAlign: ALEFT } },
        { type: "label", labelIndex: 6, style: { width: 175, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 145, textAlign: ALEFT } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "label", labelIndex: 6, style: { width: 145, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 95, textAlign: ALEFT } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "label", labelIndex: 6, style: { width: 95, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 55, textAlign: ALEFT } },
        { type: "label", labelIndex: 2, style: { width: 90, textAlign: ACENTER } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "label", labelIndex: 4, style: { width: 90, textAlign: ACENTER } },
        { type: "label", labelIndex: 6, style: { width: 55, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 45, textAlign: ALEFT } },
        { type: "dots" },
        { type: "label", labelIndex: 2, style: { width: 90, textAlign: ACENTER } },
        { type: "dots" },
        { type: "space", style: { width: 40 } },
        { type: "dots" },
        { type: "label", labelIndex: 4, style: { width: 90, textAlign: ACENTER } },
        { type: "dots" },
        { type: "label", labelIndex: 6, style: { width: 45, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 30, textAlign: ALEFT } },
        { type: "label", labelIndex: 1, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 2, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 3, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 4, style: defaultHeatmapLegendLabelStyle },
        { type: "space", style: { width: 10 } },
        { type: "label", labelIndex: 5, style: defaultHeatmapLegendLabelStyle },
        { type: "label", labelIndex: 6, style: { width: 30, textAlign: ARIGHT } },
    ],
];

const defaultHeatmapSmallLegendStyle = { width: 40, textAlign: ACENTER };

export const heatmapSmallLegendConfigMatrix: IColorLabelConfigItem[][] = [
    [
        { type: "label", labelIndex: 0, style: { width: 63, textAlign: ALEFT } },
        { type: "label", labelIndex: 7, style: { width: 63, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 63, textAlign: ALEFT } },
        { type: "label", labelIndex: 7, style: { width: 63, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 63, textAlign: ALEFT } },
        { type: "label", labelIndex: 7, style: { width: 63, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 63, textAlign: ALEFT } },
        { type: "label", labelIndex: 7, style: { width: 63, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 33, textAlign: ALEFT } },
        { type: "label", labelIndex: 3, style: { width: 42, textAlign: ACENTER } },
        { type: "label", labelIndex: 7, style: { width: 51, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 33, textAlign: ALEFT } },
        { type: "label", labelIndex: 3, style: { width: 42, textAlign: ACENTER } },
        { type: "label", labelIndex: 7, style: { width: 51, textAlign: ARIGHT } },
    ],
];

export const colorSmallLegendConfigMatrix: IColorLabelConfigItem[][] = [
    [
        { type: "label", labelIndex: 0, style: { width: 54, textAlign: ALEFT } },
        { type: "label", labelIndex: 6, style: { width: 54, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 54, textAlign: ALEFT } },
        { type: "label", labelIndex: 6, style: { width: 54, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 54, textAlign: ALEFT } },
        { type: "label", labelIndex: 6, style: { width: 54, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 54, textAlign: ALEFT } },
        { type: "label", labelIndex: 6, style: { width: 54, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 24, textAlign: ALEFT } },
        { type: "label", labelIndex: 4, style: { width: 32, textAlign: ACENTER } },
        { type: "label", labelIndex: 6, style: { width: 52, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 24, textAlign: ALEFT } },
        { type: "label", labelIndex: 4, style: { width: 32, textAlign: ACENTER } },
        { type: "label", labelIndex: 6, style: { width: 52, textAlign: ARIGHT } },
    ],
];

export const heatmapMediumLegendConfigMatrix: IColorLabelConfigItem[][] = [
    [
        { type: "label", labelIndex: 0, style: { width: 138, textAlign: ALEFT } },
        { type: "label", labelIndex: 7, style: { width: 138, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 115, textAlign: ALEFT } },
        { type: "dots" },
        { type: "space", style: { width: 26 } },
        { type: "dots" },
        { type: "label", labelIndex: 7, style: { width: 115, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 75, textAlign: ALEFT } },
        { type: "dots" },
        { type: "space", style: { width: 30 } },
        { type: "dots" },
        { type: "space", style: { width: 26 } },
        { type: "dots" },
        { type: "space", style: { width: 30 } },
        { type: "dots" },
        { type: "label", labelIndex: 7, style: { width: 75, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 45, textAlign: ALEFT } },
        { type: "label", labelIndex: 2, style: { width: 70, textAlign: ACENTER } },
        { type: "dots" },
        { type: "space", style: { width: 26 } },
        { type: "dots" },
        { type: "label", labelIndex: 5, style: { width: 70, textAlign: ACENTER } },
        { type: "label", labelIndex: 7, style: { width: 45, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 35, textAlign: ALEFT } },
        { type: "dots" },
        { type: "label", labelIndex: 2, style: { width: 70, textAlign: ACENTER } },
        { type: "dots" },
        { type: "space", style: { width: 26 } },
        { type: "dots" },
        { type: "label", labelIndex: 5, style: { width: 70, textAlign: ACENTER } },
        { type: "dots" },
        { type: "label", labelIndex: 7, style: { width: 35, textAlign: ARIGHT } },
    ],
    [
        { type: "label", labelIndex: 0, style: { width: 20, textAlign: ALEFT } },
        { type: "label", labelIndex: 1, style: defaultHeatmapSmallLegendStyle },
        { type: "label", labelIndex: 2, style: defaultHeatmapSmallLegendStyle },
        { type: "label", labelIndex: 3, style: { width: 38, textAlign: ACENTER } },
        { type: "label", labelIndex: 4, style: { width: 38, textAlign: ACENTER } },
        { type: "label", labelIndex: 5, style: defaultHeatmapSmallLegendStyle },
        { type: "label", labelIndex: 6, style: defaultHeatmapSmallLegendStyle },
        { type: "label", labelIndex: 7, style: { width: 20, textAlign: ARIGHT } },
    ],
];

export function buildColorLabelsConfig(labels: string[], config: any[]): any[] {
    return config
        .map((element: any, index: number) => {
            switch (element.type) {
                case "label":
                    return {
                        label: labels[element.labelIndex],
                        style: element.style,
                        key: `${element.type}-${index}`,
                    };

                case "space":
                    return getEmptyBlock(element.style, index);

                case "dots":
                    return getSkippedLabelBlock(index);
                default:
                    return null;
            }
        })
        .filter((value: any) => value !== null);
}

const LABEL_THRESHOLDS = {
    large: [5, 8, 10, 15, 18],
    medium: [4, 7, 9, 13, 15],
    small: [2, 5, 8, 10, 12],
};

function getColorLegendLabelsConfiguration(
    legendLabels: string[],
    size: IColorLegendSize,
    isVertical: boolean,
) {
    const numberOfLabels = legendLabels.length;
    const firstLabelLength = head(legendLabels)?.length ?? 0;
    const lastLabelLength = last(legendLabels)?.length ?? 0;
    const maxLabelLength = firstLabelLength > lastLabelLength ? firstLabelLength : lastLabelLength;
    const labelLengths = LABEL_THRESHOLDS[size];

    const shorteningConfig = isVertical
        ? verticalHeatmapConfig
        : getHorizontalShorteningLabelConfig(labelLengths, maxLabelLength, size, numberOfLabels);

    return buildColorLabelsConfig(legendLabels, shorteningConfig);
}

function getHorizontalShorteningLabelConfig(
    labelLengths: number[],
    maxLabelLength: number,
    size: IColorLegendSize,
    numberOfLabels: number,
): IColorLabelConfigItem[] {
    const shorteningLevel = getColorLabelShorteningLevel(labelLengths, maxLabelLength);
    if (size === "small") {
        /**
         * Geo chart color legend has only 7 labels
         */
        if (numberOfLabels == 7) {
            return colorSmallLegendConfigMatrix[shorteningLevel];
        }
        return heatmapSmallLegendConfigMatrix[shorteningLevel];
    }

    if (size === "medium") {
        return heatmapMediumLegendConfigMatrix[shorteningLevel];
    }

    if (numberOfLabels === 8) {
        return heatmapLegendConfigMatrix[shorteningLevel];
    }
    return colorLegendConfigMatrix[shorteningLevel];
}

function getColorLabelShorteningLevel(labelLengths: number[], maxLabelLength: number): number {
    let shorteningLevel: number;
    if (inRange(maxLabelLength, 0, labelLengths[0])) {
        shorteningLevel = 5;
    } else if (inRange(maxLabelLength, labelLengths[0], labelLengths[1])) {
        shorteningLevel = 4;
    } else if (inRange(maxLabelLength, labelLengths[1], labelLengths[2])) {
        shorteningLevel = 3;
    } else if (inRange(maxLabelLength, labelLengths[2], labelLengths[3])) {
        shorteningLevel = 2;
    } else if (inRange(maxLabelLength, labelLengths[3], labelLengths[4])) {
        shorteningLevel = 1;
    } else {
        shorteningLevel = 0;
    }
    return shorteningLevel;
}

export function calculateFluidLegend(
    seriesCount: number,
    containerWidth: number,
): {
    hasPaging: boolean;
    itemWidth: number;
    visibleItemsCount: number;
} {
    // -1 because flex dimensions provide rounded number and the real width can be float
    const realWidth = containerWidth - 2 * LEGEND_PADDING - 1;

    if (seriesCount <= 2) {
        return {
            hasPaging: false,
            itemWidth: realWidth / seriesCount,
            visibleItemsCount: seriesCount,
        };
    }

    let columnsCount = Math.floor(realWidth / RESPONSIVE_ITEM_MIN_WIDTH);
    let itemWidth = realWidth / columnsCount;
    let hasPaging = false;

    const rowsCount = Math.ceil(seriesCount / columnsCount);

    // Recalculate with paging
    if (rowsCount > RESPONSIVE_VISIBLE_ROWS) {
        const legendWidthWithPaging = realWidth - FLUID_PAGING_WIDTH;
        columnsCount = Math.floor(legendWidthWithPaging / RESPONSIVE_ITEM_MIN_WIDTH);
        itemWidth = legendWidthWithPaging / columnsCount;
        hasPaging = true;
    }

    const visibleItemsCount = columnsCount * RESPONSIVE_VISIBLE_ROWS;

    return {
        itemWidth,
        hasPaging,
        visibleItemsCount,
    };
}

function getStaticVisibleItemsCount(
    containerHeight: number,
    columnsNumber: number,
    withPaging: boolean,
    paginationHeight: number,
) {
    const pagingHeight = withPaging ? paginationHeight : 0;
    const height = containerHeight - pagingHeight;
    return Math.floor(height / ITEM_HEIGHT) * columnsNumber;
}

export function calculateStaticLegend(
    seriesCount: number,
    containerHeight: number,
    columnsNumber: number = 1,
    paginationHeight: number = STATIC_PAGING_HEIGHT,
): {
    hasPaging: boolean;
    visibleItemsCount: number;
} {
    if (containerHeight < ITEM_HEIGHT) {
        return {
            hasPaging: false,
            visibleItemsCount: 0,
        };
    }

    const visibleItemsCount = getStaticVisibleItemsCount(
        containerHeight,
        columnsNumber,
        false,
        paginationHeight,
    );
    if (visibleItemsCount >= seriesCount) {
        return {
            hasPaging: false,
            visibleItemsCount,
        };
    }
    return {
        hasPaging: true,
        visibleItemsCount: getStaticVisibleItemsCount(containerHeight, columnsNumber, true, paginationHeight),
    };
}

function getColorLegendLabels(
    series: IColorLegendItem[],
    format: string | undefined,
    numericSymbols: string[],
): string[] {
    const min = head(series)?.range?.from ?? 0;
    const max = last(series)?.range?.to ?? 0;
    const diff = max - min;

    return range(series.length + 1).map((index) => {
        let value: number;

        if (index === 0) {
            value = series[0]?.range?.from ?? 0;
        } else if (index === series.length) {
            value = series[index - 1]?.range?.to ?? 0;
        } else {
            value = series[index]?.range?.from ?? 0;
        }

        return formatLegendLabel(value, format, diff, numericSymbols);
    });
}

const MIDDLE_LEGEND_BOX_INDEX = 3;

function getColorBoxes(series: IColorLegendItem[], theme?: ITheme): IColorLegendBox[] {
    const backgroundColor = theme?.chart?.backgroundColor ?? theme?.palette?.complementary?.c0 ?? "#fff";
    const borderColor = theme?.palette?.complementary?.c4 ?? "#ccc";

    const getBoxStyle = (item: IColorLegendItem) => ({
        backgroundColor: item.color,
        border: isEqual(parseRGBString(item.color), parseRGBString(backgroundColor))
            ? `1px solid ${borderColor}`
            : "none",
    });

    return series.map((item: IColorLegendItem, index: number) => {
        const style = getBoxStyle(item);
        const middle = index === MIDDLE_LEGEND_BOX_INDEX ? "middle" : null;

        return {
            class: middle,
            key: `item-${index}`,
            style,
        };
    });
}

export function getColorLegendConfiguration(
    series: IColorLegendItem[],
    format: string | undefined,
    numericSymbols: string[],
    size: IColorLegendSize,
    position: string,
    theme?: ITheme,
): IColorLegendConfig {
    const legendLabels = getColorLegendLabels(series, format, numericSymbols);

    const classes = ["viz-legend", "color-legend", `position-${position}`, size];

    const isVertical = position === LEFT || position === RIGHT;
    const finalLabels = getColorLegendLabelsConfiguration(legendLabels, size, isVertical);
    const boxes = getColorBoxes(series, theme);

    return {
        classes,
        labels: finalLabels,
        boxes,
        position,
    };
}

export const LEGEND_AXIS_INDICATOR = "legendAxisIndicator";
export const LEGEND_SEPARATOR = "legendSeparator";

/**
 * @internal
 */
export function formatLegendLabel(
    value: number,
    format: string | undefined,
    diff: number,
    numericSymbols: string[],
): string {
    if (format?.includes("%")) {
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

/**
 * @internal
 */
export const FLUID_LEGEND_THRESHOLD = 768;

/**
 * @internal
 */
export function shouldShowFluid(documentObj: Document): boolean {
    if (!documentObj) {
        return false;
    }

    return documentObj.documentElement.clientWidth < FLUID_LEGEND_THRESHOLD;
}
