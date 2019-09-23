// (C) 2019 GoodData Corporation

import isEmpty = require("lodash/isEmpty");

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IColor {
    r: number;
    g: number;
    b: number;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IColorPaletteItem {
    guid: string;
    fill: IColor;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type IColorPalette = IColorPaletteItem[];

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type GuidType = "guid";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type RGBType = "rgb";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IGuidColorItem {
    type: GuidType;
    value: string;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IRGBColorItem {
    type: RGBType;
    value: IColor;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type IColorItem = IGuidColorItem | IRGBColorItem;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IColorMappingProperty {
    id: string;
    color: IColorItem;
}

//
// Type guards
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isGuidColorItem(obj: any): obj is IGuidColorItem {
    return !isEmpty(obj) && (obj as IGuidColorItem).type === "guid";
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isRgbColorItem(obj: any): obj is IRGBColorItem {
    return !isEmpty(obj) && (obj as IRGBColorItem).type === "rgb";
}
