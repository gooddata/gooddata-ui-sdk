// (C) 2007-2019 GoodData Corporation
import { TOP } from "../chart/legend/PositionTypes";
import { PositionType } from "../Config";

export interface ILegendOptions {
    enabled: boolean;
    toggleEnabled: boolean;
    position: PositionType;
    format: string;
    items: LegendOptionsItemType[];
    responsive?: boolean;
}

export type LegendOptionsItemType = IBaseLegendItem | IHeatmapLegendItem;

export interface IBaseLegendItem {
    name: string;
    color: string; // in format rgb(20,178,226)
    legendIndex: number;
    yAxis: number;
}

export interface IHeatmapLegendItem {
    range: IRange;
    isVisible?: boolean;
    color: string;
    legendIndex: number;
}

export interface IRange {
    from: number;
    to: number;
}

export const DEFAULT_LEGEND_CONFIG = {
    enabled: true,
    position: TOP,
};
