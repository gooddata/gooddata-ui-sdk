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

const requiredComplementaryKeys = [
    "c0",
    "c9",
] as const satisfies readonly (keyof IThemeComplementaryPalette)[];

/**
 * Returns the dot-separated paths of complementary palette shades a theme must define but omits.
 *
 * @remarks
 * `c0` and `c9` are the endpoints of the complementary ramp and, unlike `c1`-`c8`, are never
 * interpolated by `getComplementaryPalette` — keep this list in step with the shades it passes
 * through untouched. Omitting one leaves its `--gd-palette-complementary-*` variable unset, so
 * every element reading it falls back to a default chosen for the opposite background.
 *
 * Reported separately from {@link findInvalidThemeColors} because the theme still applies: the
 * result is a degraded rendering rather than a theme that cannot be used at all. A shade that is
 * present but unparseable counts as invalid rather than missing, matching that function.
 *
 * @internal
 */
export const findMissingRequiredThemeColors = (theme: ITheme | undefined): string[] => {
    // Parsed from an API response, so the required shades may well be absent despite the type.
    const complementary: Partial<IThemeComplementaryPalette> | undefined = theme?.palette?.complementary;

    if (!complementary) {
        return [];
    }

    return requiredComplementaryKeys
        .filter((key) => complementary[key] === undefined)
        .map((key) => `complementary.${key}`);
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
