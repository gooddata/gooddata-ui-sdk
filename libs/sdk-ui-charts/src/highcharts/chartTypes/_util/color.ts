// (C) 2007-2021 GoodData Corporation
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { getColorPaletteFromColors } from "@gooddata/sdk-ui-vis-commons";
import { IChartConfig } from "../../../interfaces/index.js";
import { IRgbColorValue, IColorPalette } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";

export const WHITE = "rgb(255, 255, 255)";
export const BLACK = "rgb(0, 0, 0)";
export const GRAY = "rgb(201, 213, 223)";
export const AXIS_LINE_COLOR = "#d5d5d5";
export const TRANSPARENT = "transparent";

export const HEATMAP_BLUE_COLOR_PALETTE = [
    "rgb(255,255,255)",
    "rgb(197,236,248)",
    "rgb(138,217,241)",
    "rgb(79,198,234)",
    "rgb(20,178,226)",
    "rgb(22,151,192)",
    "rgb(0,110,145)",
];

export const DEFAULT_HEATMAP_BLUE_COLOR: IRgbColorValue = { r: 0, g: 110, b: 145 };

export const DEFAULT_HEATMAP_BLUE_BASE_COLOR: IRgbColorValue = { r: 20, g: 178, b: 226 };

export const DEFAULT_BULLET_GRAY_COLOR: IRgbColorValue = {
    r: 217,
    g: 220,
    b: 226,
};

export const DEFAULT_WATERFALL_COLORS = [
    "properties.color.total",
    "properties.color.positive",
    "properties.color.negative",
];

/**
 * @internal
 */
export function getValidColorPalette(config: IChartConfig): IColorPalette {
    return isEmpty(config.colorPalette)
        ? isEmpty(config.colors)
            ? DefaultColorPalette
            : getColorPaletteFromColors(config.colors)
        : config.colorPalette;
}
