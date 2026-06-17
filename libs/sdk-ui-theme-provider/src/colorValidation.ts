// (C) 2026 GoodData Corporation

import { parseToRgb } from "polished";

import {
    type ITheme,
    type IThemeColorFamily,
    type IThemeComplementaryPalette,
    type IThemePalette,
} from "@gooddata/sdk-model";

/**
 * Returns true if the provided value is a color string that the `polished` library can parse
 * (hex, rgb(a), hsl(a) or a named color).
 *
 * @remarks
 * `polished` is the single source of truth for what the theme application code can consume:
 * the same parser (`parseToRgb`) backs `mix`, `getContrast`, `shade`, `transparentize` and
 * `getLuminance`. Validating with it guarantees this check agrees exactly with the functions
 * that would otherwise throw on an unparseable color.
 *
 * @internal
 */
export const isValidThemeColor = (color: unknown): boolean => {
    if (typeof color !== "string" || color.trim() === "") {
        return false;
    }

    try {
        parseToRgb(color);
        return true;
    } catch {
        return false;
    }
};

/**
 * A palette color that cannot be parsed, together with its dot-separated location in the palette
 * (e.g. `complementary.c9` or `primary.base`).
 *
 * @internal
 */
export interface IInvalidThemeColor {
    path: string;
    value: string;
}

const colorFamilyKeys: (keyof IThemeColorFamily)[] = ["base", "light", "dark", "contrast"];

const collectInvalidFamilyColors = (
    family: IThemeColorFamily | undefined,
    familyKey: string,
): IInvalidThemeColor[] => {
    if (!family) {
        return [];
    }

    return colorFamilyKeys
        .filter((key) => family[key] !== undefined && !isValidThemeColor(family[key]))
        .map((key) => ({ path: `${familyKey}.${key}`, value: family[key]! }));
};

const collectInvalidComplementaryColors = (
    complementary: IThemeComplementaryPalette | undefined,
): IInvalidThemeColor[] => {
    if (!complementary) {
        return [];
    }

    return (Object.keys(complementary) as (keyof IThemeComplementaryPalette)[])
        .filter((key) => complementary[key] !== undefined && !isValidThemeColor(complementary[key]))
        .map((key) => ({ path: `complementary.${key}`, value: complementary[key]! }));
};

/**
 * Walks the theme palette and returns the colors that cannot be parsed, each with its location.
 *
 * @remarks
 * Only palette colors are inspected, as those are the values fed into the `polished` color
 * functions during theme application. An empty array means every palette color is valid.
 *
 * @internal
 */
export const findInvalidThemeColors = (theme: ITheme | undefined): IInvalidThemeColor[] => {
    const palette: IThemePalette | undefined = theme?.palette;

    if (!palette) {
        return [];
    }

    return [
        ...collectInvalidFamilyColors(palette.primary, "primary"),
        ...collectInvalidFamilyColors(palette.error, "error"),
        ...collectInvalidFamilyColors(palette.warning, "warning"),
        ...collectInvalidFamilyColors(palette.success, "success"),
        ...collectInvalidFamilyColors(palette.info, "info"),
        ...collectInvalidComplementaryColors(palette.complementary),
    ];
};
