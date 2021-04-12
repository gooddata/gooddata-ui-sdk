// (C) 2007-2021 GoodData Corporation

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
export type LegendOptionsItemType = IBaseLegendItem | IHeatmapLegendItem;

/**
 * @internal
 */
export interface IBaseLegendItem {
    name: string;
    color: string; // in format rgb(20,178,226)
    legendIndex: number;
    yAxis: number;
}

/**
 * @internal
 */
export interface IHeatmapLegendItem {
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
    position: LegendPosition.TOP,
};

/**
 * @internal
 */
export interface IPushpinCategoryLegendItem {
    name: string;
    uri: string;
    color?: string;
    legendIndex: number;
    isVisible?: boolean;
}

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
export type IHeatmapLegendSize = "large" | "medium" | "small";
