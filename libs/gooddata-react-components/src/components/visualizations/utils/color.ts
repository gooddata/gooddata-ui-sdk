// (C) 2007-2018 GoodData Corporation
import { IColor, IColorItem } from "@gooddata/gooddata-js";
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { AFM, Execution } from "@gooddata/typings";
import { getMappingHeaderLocalIdentifier } from "../../../helpers/mappingHeader";
import {
    IChartConfig,
    IColorMapping,
    IColorMapping2,
    IColorPalette,
    IColorPaletteItem,
    INewChartConfig,
} from "../../../interfaces/Config";
import { IHeaderPredicate, IHeaderPredicateContext } from "../../../interfaces/HeaderPredicate";
import { IMappingHeader, isMappingHeaderAttributeItem } from "../../../interfaces/MappingHeader";
import { DEFAULT_COLOR_PALETTE } from "./defaultColors";
import isEmpty = require("lodash/isEmpty");
import isEqual = require("lodash/isEqual");

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

export const DEFAULT_HEATMAP_BLUE_COLOR: IColor = {
    r: 0,
    g: 110,
    b: 145,
};

function lighter(color: number, percent: number) {
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent);

    return Math.round((t - color) * p) + color;
}

function formatColor(red: number, green: number, blue: number) {
    return `rgb(${red},${green},${blue})`;
}

export function parseRGBColorCode(color: string) {
    const f = color.split(",");
    const R = parseInt(f[0].slice(4), 10);
    const G = parseInt(f[1], 10);
    const B = parseInt(f[2], 10);
    return { R, G, B };
}

/**
 * Source:
 *     http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 */
export function getLighterColor(color: string, percent: number) {
    const { R, G, B } = parseRGBColorCode(color);

    return formatColor(lighter(R, percent), lighter(G, percent), lighter(B, percent));
}

export function getLighterColorFromRGB(color: IColor, percent: number) {
    const { r, g, b } = color;

    return {
        r: lighter(r, percent),
        g: lighter(g, percent),
        b: lighter(b, percent),
    };
}

export function normalizeColorToRGB(color: string) {
    const hexPattern = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
    return color.replace(hexPattern, (_prefix: string, r: string, g: string, b: string) => {
        return `rgb(${[r, g, b].map(value => parseInt(value, 16).toString(10)).join(", ")})`;
    });
}

export function getColorPaletteFromColors(colors: string[]): IColorPalette {
    try {
        return colors.map((color: string, index: number) => {
            const { R, G, B } = parseRGBColorCode(normalizeColorToRGB(color));
            if (isNaN(R) || isNaN(G) || isNaN(B)) {
                throw Error;
            }
            return {
                guid: String(index),
                fill: {
                    r: R,
                    g: G,
                    b: B,
                },
            };
        });
    } catch (_ignored) {
        return DEFAULT_COLOR_PALETTE;
    }
}

export function getRgbString(color: IColorPaletteItem): string {
    return `rgb(${color.fill.r},${color.fill.g},${color.fill.b})`;
}

export function getValidColorPalette(config: IChartConfig) {
    return isEmpty(config.colorPalette)
        ? isEmpty(config.colors)
            ? DEFAULT_COLOR_PALETTE
            : getColorPaletteFromColors(config.colors)
        : config.colorPalette;
}

export function getValidColorPalette2(config: INewChartConfig) {
    return isEmpty(config.colorPalette)
        ? isEmpty(config.colors)
            ? DEFAULT_COLOR_PALETTE
            : getColorPaletteFromColors(config.colors)
        : config.colorPalette;
}

export function isCustomPalette(palette: IColorPalette) {
    return !isEqual(palette, DEFAULT_COLOR_PALETTE);
}

export function getColorFromMapping(
    mappingHeader: IMappingHeader,
    colorMapping: IColorMapping[],
    executionResponse: Execution.IExecutionResponse,
    afm: AFM.IAfm,
): IColorItem {
    if (!colorMapping) {
        return undefined;
    }

    const mapping = colorMapping.find(item => item.predicate(mappingHeader, { afm, executionResponse }));
    return mapping && mapping.color;
}

export function getColorFromMapping2(
    mappingHeader: IMappingHeader,
    colorMapping: IColorMapping2[],
    dv: DataViewFacade,
): IColorItem {
    if (!colorMapping) {
        return undefined;
    }

    const mapping = colorMapping.find(item => item.predicate(mappingHeader, { dv }));
    return mapping && mapping.color;
}

export function getColorByGuid(colorPalette: IColorPalette, guid: string, index: number) {
    const inPalette = colorPalette.find((item: any) => item.guid === guid);

    return inPalette ? inPalette.fill : colorPalette[index % colorPalette.length].fill;
}

export function getRgbStringFromRGB(color: IColor) {
    return `rgb(${color.r},${color.g},${color.b})`;
}

export function getColorMappingPredicate(idOrUri: string): IHeaderPredicate {
    return (header: IMappingHeader, _context: IHeaderPredicateContext): boolean => {
        if (isMappingHeaderAttributeItem(header)) {
            return idOrUri ? idOrUri === header.attributeHeaderItem.uri : false;
        }

        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        return headerLocalIdentifier ? headerLocalIdentifier === idOrUri : false;
    };
}

// For re-exporting in index.ts
// Create object here since TSC can't reexport external types used by getColorMappingPredicate
export default {
    getColorByGuid,
    getColorMappingPredicate,
};
