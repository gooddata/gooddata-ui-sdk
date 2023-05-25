// (C) 2020 GoodData Corporation
import { GD_COLOR_HIGHLIGHT } from "../utils/constants.js";

const HEX3_REGEX = /^#([\da-f])([\da-f])([\da-f])/i;
const HEX6_REGEX = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/;

interface IRgbaColor {
    r: number;
    g: number;
    b: number;
    a: 1;
}

/**
 * Helper function that transforms any string representation of a color
 * into dojo.Color object.
 */
export function toColor(hexColor: string): IRgbaColor {
    let parsed: number[];
    const p = parseInt;
    const color = hexColor.replace(/\s*/g, ""); // Remove all spaces
    const hex3Match = HEX3_REGEX.exec(color);
    const hex6Match = HEX6_REGEX.exec(color);

    if (hex6Match) {
        // 6 digit hex
        parsed = [p(hex6Match[1], 16), p(hex6Match[2], 16), p(hex6Match[3], 16)];
    } else if (hex3Match) {
        // 3 digit hex
        parsed = [p(hex3Match[1], 16) * 17, p(hex3Match[2], 16) * 17, p(hex3Match[3], 16) * 17];
    }

    return {
        r: parsed[0],
        g: parsed[1],
        b: parsed[2],
        a: 1,
    };
}

/**
 * Helper function that returns a luminance of a color.
 * Color must be an object with r, g and b properties.
 *
 * @returns Luminance in interval 0 - 255
 */
export function luminanceOf(color: IRgbaColor): number {
    // Imprecise luminance values may arise from finite precision of RGB coefitients
    // We have to round this value to two decimal places to avoid strange results
    const raw = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
    return Math.round(raw * 100) / 100;
}

/**
 * Function that chooses from two colors based on luminance
 * of control color. This luminance is compared to specified threshold value.
 *
 * @param color - color as a String
 * @param threshold - Luminance threshold value in interval 1 - 255
 * @param dark - Dark color variant for when control color luminance is higher than threshold
 * @param light - Light color variant for when control color luminance is lower or equal than threshold
 */
export function chooseColor(hexColor: string, threshold: number, dark: string, light: string): string {
    if (!hexColor) {
        return "";
    }

    return luminanceOf(toColor(hexColor)) > threshold ? dark : light;
}

export function getTextColor(headerTextColor: string, headerColor: string): string {
    const detectedColor = chooseColor(headerColor, 128, "#000", "#FFF");

    return headerTextColor || detectedColor;
}

export function getItemActiveColor(activeColor: string, headerColor: string): string {
    if (!activeColor && !headerColor) {
        return `${GD_COLOR_HIGHLIGHT}`;
    }

    const detectedColor = chooseColor(headerColor, 128, "#000", "#FFF");

    return activeColor || detectedColor;
}

export function getWorkspacePickerHoverColor(headerColor: string): string {
    const detectedColor = chooseColor(headerColor, 254.99, "rgba(0, 0, 0, .02)", "");

    return detectedColor || "";
}

export function getItemHoverColor(
    headerColor: string,
    activeColor: string,
    lightOpacity = 0.5,
    darkOpacity = 0.25,
): string {
    const backgroundColorLuminance = luminanceOf(toColor(headerColor || "#000"));
    const emphasisColorLuminance = luminanceOf(toColor(activeColor || "#fff"));

    return emphasisColorLuminance > backgroundColorLuminance
        ? `rgba(255, 255, 255, ${lightOpacity})`
        : `rgba(0, 0, 0, ${darkOpacity})`;
}

export function getSeparatorColor(headerColor: string, activeColor: string): string {
    return getItemHoverColor(headerColor, activeColor, 0.25, 0.08);
}
