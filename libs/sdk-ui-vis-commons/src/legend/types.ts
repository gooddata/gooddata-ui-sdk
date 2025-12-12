// (C) 2007-2025 GoodData Corporation

import { type IPatternObject } from "../coloring/types.js";

/**
 * @internal
 */
export const LegendPosition: { [name: string]: PositionType } = {
    LEFT: "left",
    RIGHT: "right",
    TOP: "top",
    BOTTOM: "bottom",
    AUTO: "auto",
};

/**
 * @internal
 */
export const SupportedLegendPositions: PositionType[] = ["left", "right", "top", "bottom"];

/**
 * @internal
 */
export interface ILegendOptions {
    enabled: boolean;
    toggleEnabled: boolean;
    position: PositionType;
    format: string;
    items: LegendOptionsItemType[];
    responsive?: boolean | "autoPositionWithPopup";
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    seriesMapper?: (visibleSeries: any) => any;
}

/**
 * @internal
 */
export type LegendOptionsItemType = ISeriesItemMetric | IHeatmapLegendItem;

/**
 * @internal
 */
export interface IHeatmapLegendItem {
    type: string;
    range: IRange;
    isVisible?: boolean;
    color: string;
    legendIndex: number;
}

/**
 * @internal
 */
export interface IColorLegendItem {
    range: IRange;
    color: string;
}

/**
 * @internal
 */
export interface IGeoChartLegendData {
    colorData?: IColorLegendItem[];
    sizeData?: number[];
}

/**
 * @internal
 */
export interface IRange {
    from: number;
    to: number;
}

/**
 * @internal
 */
export const DEFAULT_LEGEND_CONFIG = {
    enabled: true,
    position: LegendPosition["TOP"],
};

/**
 * Category legend item for geo charts.
 *
 * @remarks
 * Represents a single item in the category legend, typically corresponding to
 * a segment value with its associated color and visibility state.
 *
 * @internal
 */
export interface IGeoCategoryLegendItem {
    type: string;
    name: string;
    uri: string;
    color?: string;
    legendIndex: number;
    isVisible: boolean;
}

/**
 * @deprecated Use IGeoCategoryLegendItem instead.
 * @internal
 */
export type IPushpinCategoryLegendItem = IGeoCategoryLegendItem;

/**
 * TODO: rename
 * @internal
 */
export type PositionType = "left" | "right" | "top" | "bottom" | "auto";

/**
 * @internal
 */
export type ItemBorderRadiusPredicate = (item: any) => boolean;

/**
 * @internal
 */
export type IColorLegendSize = "large" | "medium" | "small";

/**
 * @internal
 */
export const LEGEND_AXIS_INDICATOR = "legendAxisIndicator";
/**
 * @internal
 */
export const LEGEND_SEPARATOR = "legendSeparator";
/**
 * @internal
 */
export const LEGEND_GROUP = "legend-group";

/**
 * @internal
 */
export type ISeriesItem = ISeriesItemMetric | ISeriesItemAxisIndicator | ISeriesItemSeparator;

/**
 * @internal
 */
export type ISeriesItemSeparator = {
    type: typeof LEGEND_SEPARATOR;
};

/**
 * @internal
 */
export function isSeriesItemSeparator(item: ISeriesItem): item is ISeriesItemSeparator {
    return "type" in item && item.type === LEGEND_SEPARATOR;
}

/**
 * @internal
 */
export type ISeriesItemMetric = {
    type: string;
    isVisible?: boolean;
    name?: string;
    color?: string | IPatternObject;
    legendIndex: number;
    pointShape?: string;
    yAxis?: number;
};

/**
 * @internal
 */
export function isSeriesItemMetric(item: ISeriesItem): item is ISeriesItemMetric {
    return "legendIndex" in item;
}

/**
 * @internal
 */
export type ISeriesItemAxisIndicator = {
    type: typeof LEGEND_AXIS_INDICATOR;
    data?: string[];
    labelKey: string;
};

/**
 * @internal
 */
export function isSeriesItemAxisIndicator(item: ISeriesItem): item is ISeriesItemAxisIndicator {
    return "type" in item && item.type === LEGEND_AXIS_INDICATOR;
}

/**
 * @internal
 */
export type ILegendGroup = Omit<ISeriesItemAxisIndicator, "type"> & {
    type: typeof LEGEND_GROUP;
    items: ISeriesItem[];
};

/**
 * @internal
 */
export function isLegendGroup(item: IGroupedSeriesItem): item is ILegendGroup {
    return "type" in item && item.type === LEGEND_GROUP;
}

/**
 * @internal
 */
export type IGroupedSeriesItem = ISeriesItem | ILegendGroup;

/**
 * @internal
 */
export type IGroupedSeries = IGroupedSeriesItem[];
