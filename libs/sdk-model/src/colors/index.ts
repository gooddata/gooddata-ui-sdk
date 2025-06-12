// (C) 2019-2022 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { IMetadataObject } from "../ldm/metadata/index.js";

/**
 * RGB Color value specification.
 *
 * @public
 */
export interface IRgbColorValue {
    r: number;
    g: number;
    b: number;
}

function isRgbChannel(c: unknown): c is number {
    return c !== undefined && typeof c === "number" && c >= 0 && c < 256;
}

function isRgbColorValue(obj: unknown): obj is IRgbColorValue {
    if (!isEmpty(obj)) {
        const { r, g, b } = obj as IRgbColorValue;
        return isRgbChannel(r) && isRgbChannel(g) && isRgbChannel(b);
    }
    return false;
}

/**
 * An item in user-defined color palette. Item is essentially mapping of user-assigned
 * color identifier to an RGB Color value.
 *
 * @public
 */
export interface IColorPaletteItem {
    guid: string;
    fill: IRgbColorValue;
}

/**
 * Type guard checking whether the provided object is a {@link IColorPaletteItem}
 *
 * @public
 */
export function isColorPaletteItem(obj: unknown): obj is IColorPaletteItem {
    if (!isEmpty(obj)) {
        const { guid, fill } = obj as IColorPaletteItem;
        return typeof guid === "string" && guid !== undefined && isRgbColorValue(fill);
    }
    return false;
}

/**
 * User-defined color palette. Colors from the palette can be used as input to charts and naturally
 * influence the coloring strategy for the chart.
 *
 * @public
 */
export type IColorPalette = IColorPaletteItem[];

/**
 * @public
 */
export type GuidType = "guid";

/**
 * @public
 */
export type RgbType = "rgb";

/**
 * Color defined by referencing an item in the user-defined color palette.
 *
 * @public
 */
export interface IColorFromPalette {
    type: GuidType;
    value: string;
}

/**
 * Color defined used RGB values.
 *
 * @public
 */
export interface IRgbColor {
    type: RgbType;
    value: IRgbColorValue;
}

/**
 * A color. It can be specified by referencing an item from from user-defined color palette or by RGB Value.
 *
 * @public
 */
export type IColor = IColorFromPalette | IRgbColor;

/**
 * Color palette metadata object
 *
 * @alpha
 */
export interface IColorPaletteMetadataObject extends IMetadataObject {
    readonly type: "colorPalette";
    readonly colorPalette: IColorPalette;
}

/**
 * Color palette definition represents modified or created theme
 *
 * @alpha
 */
export interface IColorPaletteDefinition extends Partial<IMetadataObject> {
    readonly type: "colorPalette";
    readonly colorPalette: IColorPalette;
}

//
// Type guards
//

/**
 * Type guard checking whether the provided object is a {@link IColorFromPalette}
 *
 * @public
 */
export function isColorFromPalette(obj: unknown): obj is IColorFromPalette {
    return !isEmpty(obj) && (obj as IColorFromPalette).type === "guid";
}

/**
 * Type guard checking whether the provided object is a {@link IRgbColor}
 *
 * @public
 */
export function isRgbColor(obj: unknown): obj is IRgbColor {
    return !isEmpty(obj) && (obj as IRgbColor).type === "rgb";
}

/**
 * Returns RGB code representing the color in the provided color palette items.
 *
 * @param item - color palette item
 * @returns an `rgb(red#,green#,blue#)` code
 * @public
 */
export function colorPaletteItemToRgb(item: IColorPaletteItem): string {
    const { r, g, b } = item.fill;

    return `rgb(${r},${g},${b})`;
}

/**
 * Returns a list of RGB color codes for all items in the provided color palette.
 *
 * @param palette - color palette
 * @returns list with the same cardinality as the color palette. RGB colors appear in the same order in which
 * they appear in the palette
 * @public
 */
export function colorPaletteToColors(palette: IColorPalette): string[] {
    return palette.map(colorPaletteItemToRgb);
}
