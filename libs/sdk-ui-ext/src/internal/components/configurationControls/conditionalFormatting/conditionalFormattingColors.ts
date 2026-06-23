// (C) 2026 GoodData Corporation

import { type IColor, type IColorPalette, type IRgbColorValue } from "@gooddata/sdk-model";
import { getColorByGuid, getColorPaletteFromColors, getRgbFromWebColor } from "@gooddata/sdk-ui-vis-commons";

// Preset semantic swatches (red / green / gray / white); the custom RGB picker covers everything else.
// CF_DEFAULT_COLOR is the new-condition default and the first preset, kept here as the single source.
export const CF_DEFAULT_COLOR = "#E54D40";
const PRESET_HEXES = [CF_DEFAULT_COLOR, "#3DB36B", "#94A1AD", "#FFFFFF"];

/**
 * Fixed palette backing the conditional-formatting color dropdowns. Reuses the chart color palette
 * builder so the dropdown's palette branch works unchanged; the dropdown's custom-color branch
 * handles any RGB value outside these presets.
 */
export const CF_COLOR_PALETTE: IColorPalette = getColorPaletteFromColors(PRESET_HEXES);

const channelToHex = (channel: number): string =>
    Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0");

export const rgbToHex = ({ r, g, b }: IRgbColorValue): string =>
    `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`.toUpperCase();

// Parses a stored hex string into an RGB value; null when absent/unparseable. Internal to hexToColor.
const hexToRgb = (hex: string | undefined): IRgbColorValue | null => (hex ? getRgbFromWebColor(hex) : null);

/** Maps a stored hex string to the dropdown's selected item (palette guid when it matches a preset). */
export function hexToColor(hex: string | undefined): IColor | undefined {
    const rgb = hexToRgb(hex);
    if (!rgb) {
        return undefined;
    }
    const preset = CF_COLOR_PALETTE.find((item) => rgbToHex(item.fill) === rgbToHex(rgb));
    return preset ? { type: "guid", value: preset.guid } : { type: "rgb", value: rgb };
}

/** Resolves a dropdown selection (palette guid or raw RGB) back to the stored hex string. */
export function colorToHex(color: IColor): string {
    if (color.type === "guid") {
        return rgbToHex(getColorByGuid(CF_COLOR_PALETTE, color.value, 0));
    }
    return rgbToHex(color.value);
}
