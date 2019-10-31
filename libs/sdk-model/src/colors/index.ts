// (C) 2019 GoodData Corporation

import isEmpty = require("lodash/isEmpty");

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

//
// Type guards
//

/**
 * Type guard checking whether the provided object is a {@link IColorFromPalette}
 *
 * @public
 */
export function isColorFromPalette(obj: any): obj is IColorFromPalette {
    return !isEmpty(obj) && (obj as IColorFromPalette).type === "guid";
}

/**
 * Type guard checking whether the provided object is a {@link IRgbColor}
 *
 * @public
 */
export function isRgbColor(obj: any): obj is IRgbColor {
    return !isEmpty(obj) && (obj as IRgbColor).type === "rgb";
}
