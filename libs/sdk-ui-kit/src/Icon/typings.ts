// (C) 2021 GoodData Corporation

/**
 * Color in format supported by SVG
 * https://www.w3.org/TR/SVGColor12/#color
 *
 * @internal
 */
export type Color = string;

/**
 * @internal
 */
export interface IIconProps {
    className?: string;
    width?: number;
    height?: number;
    color?: Color;
    colorPalette?: { [key: string]: Color | undefined };
}
