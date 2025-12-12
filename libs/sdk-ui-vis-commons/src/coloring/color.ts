// (C) 2007-2025 GoodData Corporation
import { isEmpty, isEqual } from "lodash-es";

import {
    type IColor,
    type IColorPalette,
    type IColorPaletteItem,
    type IRgbColorValue,
    isAttributeDescriptor,
    isColorDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    DefaultColorPalette,
    type IHeaderPredicate,
    type IMappingHeader,
    getMappingHeaderLocalIdentifier,
} from "@gooddata/sdk-ui";

import { type IColorMapping, type IPatternObject } from "./types.js";

function parseRgbLike(input: string): IRgbColorValue | null {
    const match = input.match(/^rgba?\(([^)]+)\)$/i);
    if (!match) {
        return null;
    }
    const [r, g, b] = match[1]
        .split(",")
        .slice(0, 3)
        .map((value) => parseInt(value.trim(), 10));
    return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) ? { r, g, b } : null;
}

function parseHexColor(input: string): IRgbColorValue | null {
    if (!input.startsWith("#")) {
        return null;
    }
    const longHex = convertToLongHexFormat(input);
    const match = /^#([0-9a-f]{6})$/i.exec(longHex);
    if (!match) {
        return null;
    }
    const int = parseInt(match[1], 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function resolveCssColorViaDom(input: string): IRgbColorValue | null {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return null;
    }
    const element = document.createElement("div");
    element.style.display = "none";
    element.style.color = input;
    document.body.appendChild(element);
    const computed = getComputedStyle(element).color;
    document.body.removeChild(element);
    return parseRgbLike(computed);
}

/**
 * @internal
 */
export function getRgbFromWebColor(input: string): IRgbColorValue | null {
    if (!input) {
        return null;
    }
    const s = input.trim();
    return parseRgbLike(s) ?? parseHexColor(s) ?? resolveCssColorViaDom(s);
}

/**
 * @internal
 */
function lighter(color: number, percent: number) {
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent);

    return Math.round((t - color) * p) + color;
}

/**
 * @internal
 */
function formatColor(red: number, green: number, blue: number) {
    return `rgb(${red},${green},${blue})`;
}

/**
 * @internal
 */
export function parseRGBColorCode(color: string): { R: number; G: number; B: number } {
    const f = color.split(",");
    const R = parseInt(f[0].slice(4), 10);
    const G = parseInt(f[1], 10);
    const B = parseInt(f[2], 10);
    return { R, G, B };
}

/**
 * Source:
 *     http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 *
 * @internal
 */
export function getLighterColor(color: string, percent: number): string {
    const { R, G, B } = parseRGBColorCode(color);

    return formatColor(lighter(R, percent), lighter(G, percent), lighter(B, percent));
}

/**
 * Darkens a rgb() color by the given percent (0..1).
 * It uses the reverse algorithm of getLighterColor (color made lighter by it can be negated).
 * @internal
 */
export function getDarkerColor(color: string, percent: number): string {
    const { R, G, B } = parseRGBColorCode(color);

    const p = Math.abs(percent);
    const constant = 1 - p;
    const darken = (color: number) => {
        if (constant === 0) {
            return color; // percent = 1 means full white, no unique inverse; fall back to input
        }
        const c = Math.round((color - 255 * p) / constant);
        return Math.max(0, Math.min(255, c));
    };

    return formatColor(darken(R), darken(G), darken(B));
}

/**
 * @internal
 */
export function getLighterColorFromRGB(color: IRgbColorValue, percent: number): IRgbColorValue {
    const { r, g, b } = color;

    return {
        r: lighter(r, percent),
        g: lighter(g, percent),
        b: lighter(b, percent),
    };
}

/**
 * Takes short or long format of HEX color and returns long format.
 * @param color - short `#123` or long `#112233` format
 * @returns long hex format `#112233`
 */
function convertToLongHexFormat(color: string): string {
    if (color.length === 4) {
        const [r, g, b] = color.split("").slice(1);
        return "#" + r + r + g + g + b + b;
    }
    return color;
}

/**
 * @internal
 */
export function normalizeColorToRGB(color: string): string {
    if (typeof color !== "string") {
        return color;
    }

    if (color.slice(0, 3) === "rgb") {
        return color.replace(/\s/g, "");
    }

    const hexPattern = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
    return convertToLongHexFormat(color).replace(
        hexPattern,
        (_prefix: string, r: string, g: string, b: string) => {
            return `rgb(${[r, g, b].map((value) => parseInt(value, 16).toString(10)).join(",")})`;
        },
    );
}

/**
 * @internal
 */
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
    } catch {
        return DefaultColorPalette;
    }
}

/**
 * @internal
 */
export function getRgbString(color: IColorPaletteItem): string {
    return `rgb(${color.fill.r},${color.fill.g},${color.fill.b})`;
}

/**
 * @internal
 */
export function isCustomPalette(palette: IColorPalette): boolean {
    return !isEqual(palette, DefaultColorPalette);
}

/**
 * @internal
 */
export function getColorFromMapping(
    mappingHeader: IMappingHeader,
    colorMapping: IColorMapping[],
    dv: DataViewFacade,
): IColor | undefined {
    if (!colorMapping) {
        return undefined;
    }

    const mapping = colorMapping.find((item) => item.predicate(mappingHeader, { dv }));
    return mapping?.color;
}

/**
 * @internal
 */
export function getColorByGuid(colorPalette: IColorPalette, guid: string, index: number): IRgbColorValue {
    const inPalette = colorPalette.find((item: any) => item.guid === guid);

    return inPalette ? inPalette.fill : colorPalette[index % colorPalette.length].fill;
}

/**
 * @internal
 */
export function getRgbStringFromRGB(color: IRgbColorValue): string {
    return `rgb(${color.r},${color.g},${color.b})`;
}

/**
 * @internal
 */
export function parseRGBString(color: string): IRgbColorValue | null {
    const normalizedColor = normalizeColorToRGB(color);
    const result = /rgb\((.*)\)/.exec(normalizedColor);
    if (result === null) {
        return null;
    }

    const values = result[1];
    const [r, g, b] = values.split(",").map((i) => parseInt(i));
    return { r, g, b };
}

function srgbToLinear(channel: number): number {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(rgb: IRgbColorValue): number {
    const r = srgbToLinear(rgb.r);
    const g = srgbToLinear(rgb.g);
    const b = srgbToLinear(rgb.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Computes WCAG contrast ratio between two colors.
 * Accepts any web color supported by `getRgbFromWebColor` (hex, rgb/rgba, named colors).
 *
 * @internal
 */
export function getContrastRatio(colorA: string, colorB: string): number {
    const a = getRgbFromWebColor(colorA);
    const b = getRgbFromWebColor(colorB);
    if (!a || !b) {
        return NaN;
    }
    const l1 = getRelativeLuminance(a);
    const l2 = getRelativeLuminance(b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Creates new predicate for mapping colors to chart entities:
 *
 * -  if attribute header, URI is expected to match testValue
 * -  otherwise (attr or measure descriptor) expecting local identifier match
 *
 * @param testValue - right hand side to test against
 * @public
 */
export function getColorMappingPredicate(testValue: string): IHeaderPredicate {
    return (header) => {
        if (isResultAttributeHeader(header)) {
            return testValue || testValue === null || testValue === ""
                ? testValue === header.attributeHeaderItem.uri
                : false;
        }

        if (isAttributeDescriptor(header)) {
            // check both to support ref by uri and ref by identifier
            return testValue
                ? testValue === header.attributeHeader.uri || testValue === header.attributeHeader.identifier
                : false;
        }

        if (isColorDescriptor(header)) {
            return testValue ? testValue === header.colorHeaderItem.id : false;
        }

        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        return headerLocalIdentifier ? headerLocalIdentifier === testValue : false;
    };
}

/**
 * Applies color properties preferences. If palette is specified and non-empty, it is returned. Otherwise
 * non-empty colors are transformed into a palette and returned. If all else fails, default color palette
 * is returned
 *
 * @internal
 */
export function getValidColorPalette(colors?: string[], colorPalette?: IColorPalette): IColorPalette {
    if (colorPalette && !isEmpty(colorPalette)) {
        return colorPalette;
    }

    if (colors && !isEmpty(colors)) {
        return getColorPaletteFromColors(colors);
    }

    return DefaultColorPalette;
}

// For re-exporting in index.ts
// Create object here since TSC can't reexport external types used by getColorMappingPredicate

/**
 * @internal
 */
export const ColorUtils = {
    getColorByGuid,
    getColorMappingPredicate,
};

/**
 * Test whether the color is a pattern object.
 * @param color - tested color object
 *
 * @internal
 */
export function isPatternObject(color: string | IPatternObject | undefined): color is IPatternObject {
    return !isEmpty(color) && (color as IPatternObject).pattern !== undefined;
}
