// (C) 2026 GoodData Corporation

import tinycolor, { type ColorFormats } from "tinycolor2";

export type ColorNotation = "hex" | "rgb" | "hsl";

export const COLOR_NOTATIONS: readonly ColorNotation[] = ["hex", "rgb", "hsl"];

/**
 * The picker's working color.
 *
 * @remarks
 * Held as hue, saturation and lightness because that is what the controls address. Kept as channels
 * instead, turning the wheel at an extreme lightness would not come back to the hue it started from:
 * every gray, black and white is the same hue once written as channels.
 */
export interface IColorPickerValue extends ColorFormats.HSL {
    alpha: number;
}

/**
 * A point on the wheel, as a fraction of its radius from the middle, in screen orientation.
 */
export interface IColorWheelPoint {
    x: number;
    y: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function toTinyColor(value: IColorPickerValue) {
    return tinycolor({ h: value.h, s: value.s, l: value.l }).setAlpha(value.alpha);
}

export function colorPickerValueFromRgb(rgb: ColorFormats.RGB | ColorFormats.RGBA): IColorPickerValue {
    const { h, s, l, a } = tinycolor(rgb).toHsl();
    return { h, s, l, alpha: a };
}

export function colorPickerValueToRgba(value: IColorPickerValue): ColorFormats.RGBA {
    const { r, g, b } = toTinyColor(value).toRgb();
    return { r, g, b, a: value.alpha };
}

export function areColorPickerValuesEqual(left: IColorPickerValue, right: IColorPickerValue): boolean {
    const a = colorPickerValueToRgba(left);
    const b = colorPickerValueToRgba(right);
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

/**
 * Writes the value in the given notation.
 *
 * @remarks
 * Opacity is written only where there is some, so an opaque color reads as the plain three-channel
 * form.
 */
export function formatColorPickerValue(value: IColorPickerValue, notation: ColorNotation): string {
    const color = toTinyColor(value);
    switch (notation) {
        case "hex":
            return value.alpha === 1 ? color.toHexString() : color.toHex8String();
        case "rgb":
            return color.toRgbString();
        case "hsl":
            return color.toHslString();
    }
}

const APPLICABLE_WHILE_TYPING: readonly RegExp[] = [
    /^#?(?:[0-9a-f]{6}|[0-9a-f]{8})$/i,
    /^(?:rgb|hsl)a?\([^()]*\)$/i,
];

/**
 * Whether text can be applied to the document as it stands, mid-typing.
 *
 * @remarks
 * Text is applied as it is typed, so parsing is not enough: a parser reads three hex digits as a
 * color, a fourth as opacity, and `hsl(210, 53%, 1` — closed or not — as white.
 */
export function canApplyColorPickerValueWhileTyping(text: string): boolean {
    const trimmed = text.trim();
    return APPLICABLE_WHILE_TYPING.some((shape) => shape.test(trimmed));
}

/**
 * Reads a color from text.
 *
 * @remarks
 * A gray states no hue, and a parser reports 0 for it, so the current hue is carried over. Taken
 * literally the wheel would swing to red the moment someone typed a gray.
 */
export function parseColorPickerValue(
    text: string,
    current: IColorPickerValue,
): IColorPickerValue | undefined {
    const color = tinycolor(text.trim());
    if (!color.isValid()) {
        return undefined;
    }
    const { h, s, l, a } = color.toHsl();
    return { h: s === 0 ? current.h : h, s, l, alpha: a };
}

/**
 * Reads a point on the wheel as a hue and a saturation.
 *
 * @remarks
 * Past the rim the saturation clamps rather than the gesture being dropped, which keeps a drag live
 * when the pointer leaves the wheel.
 */
export function colorPickerValueFromWheel(
    point: IColorWheelPoint,
    current: IColorPickerValue,
): IColorPickerValue {
    const saturation = clamp(Math.hypot(point.x, point.y), 0, 1);
    // The exact middle points in no direction, so there is no hue to read from it.
    if (saturation === 0) {
        return { ...current, s: 0 };
    }
    const angle = (Math.atan2(point.y, point.x) * 180) / Math.PI;
    return { ...current, h: (angle + 360) % 360, s: saturation };
}

export function colorPickerValueToWheel(value: IColorPickerValue): IColorWheelPoint {
    const radians = (value.h * Math.PI) / 180;
    return { x: Math.cos(radians) * value.s, y: Math.sin(radians) * value.s };
}
