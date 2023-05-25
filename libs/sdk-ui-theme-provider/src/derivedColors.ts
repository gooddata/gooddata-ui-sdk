// (C) 2021-2022 GoodData Corporation
import { transparentize, darken, lighten, mix, setLightness } from "polished";
import { ThemeColor, IThemePalette } from "@gooddata/sdk-model";
import { CssProperty, getCssProperty } from "./cssProperty.js";

// keep it in sync with SCSS:$gd-color-text-light
const GD_COLOR_TEXT_LIGHT = "#fff";
const GD_COLOR_TEXT = "#464e56";

export const getHigherContrastColor = (amount: number, color: ThemeColor, isDarkTheme: boolean): ThemeColor =>
    color && ((isDarkTheme && lighten(amount, color)) || darken(amount, color));

export const getLowerContrastColor = (amount: number, color: ThemeColor, isDarkTheme: boolean): ThemeColor =>
    color && ((isDarkTheme && darken(amount, color)) || lighten(amount, color));

export const getLeastContrastColor = (color: ThemeColor, isDarkTheme: boolean): ThemeColor =>
    color && setLightness(isDarkTheme ? 0.04 : 0.96, color);

export const mixWith0ComplementaryColor = (
    amount: number,
    color: ThemeColor,
    palette: IThemePalette,
): ThemeColor => color && mix(amount, color, palette?.complementary?.c0 || GD_COLOR_TEXT_LIGHT);

export const mixWith8ComplementaryColor = (
    amount: number,
    color: ThemeColor,
    palette: IThemePalette,
): ThemeColor => color && mix(amount, color, palette?.complementary?.c8 || GD_COLOR_TEXT);

const getCommonDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): CssProperty[] => [
    getCssProperty(
        "palette-primary-dimmed",
        mixWith0ComplementaryColor(0.1, palette?.primary?.base, palette),
    ),
    getCssProperty(
        "palette-primary-dimmed50",
        mixWith0ComplementaryColor(0.5, palette?.primary?.base, palette),
    ),
    getCssProperty("palette-primary-lightest", getLeastContrastColor(palette?.primary?.base, isDarkTheme)),
    getCssProperty("palette-error-dimmed", mixWith0ComplementaryColor(0.1, palette?.error?.base, palette)),
    getCssProperty("palette-error-lightest", getLeastContrastColor(palette?.error?.base, isDarkTheme)),
    getCssProperty("palette-error-dimmed90", mixWith0ComplementaryColor(0.9, palette?.error?.base, palette)),
    getCssProperty(
        "palette-warning-dimmed",
        mixWith0ComplementaryColor(0.2, palette?.warning?.base, palette),
    ),
    getCssProperty(
        "palette-warning-dimmed40",
        mixWith8ComplementaryColor(0.4, palette?.warning?.base, palette),
    ),
    getCssProperty(
        "palette-warning-text-dimmed",
        mixWith8ComplementaryColor(0.2, palette?.warning?.base, palette),
    ),
    getCssProperty(
        "palette-success-dimmed",
        mixWith0ComplementaryColor(0.1, palette?.success?.base, palette),
    ),
];

const getMessagesDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-t02",
        palette?.primary?.base && transparentize(0.02, palette.primary.base),
    ),
    getCssProperty(
        "palette-error-base-t02",
        palette?.error?.base && transparentize(0.02, palette.error.base),
    ),
    getCssProperty(
        "palette-success-base-t02",
        palette?.success?.base && transparentize(0.02, palette.success.base),
    ),
    getCssProperty(
        "palette-error-base-t85",
        palette?.error?.base && transparentize(0.85, palette.error.base),
    ),
    getCssProperty(
        "palette-warning-base-t85",
        palette?.warning?.base && transparentize(0.85, palette.warning.base),
    ),
    getCssProperty("palette-info-base-t85", palette?.info?.base && transparentize(0.85, palette.info.base)),
    getCssProperty("palette-info-base-t02", palette?.info?.base && transparentize(0.02, palette.info.base)),
    getCssProperty(
        "palette-success-base-t85",
        palette?.success?.base && transparentize(0.85, palette.success.base),
    ),
];

const getDashboardsDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-t50",
        palette?.primary?.base && transparentize(0.5, palette.primary.base),
    ),
    getCssProperty(
        "palette-primary-base-t85",
        palette?.primary?.base && transparentize(0.85, palette.primary.base),
    ),
    getCssProperty(
        "palette-primary-base-t90",
        palette?.primary?.base && transparentize(0.9, palette.primary.base),
    ),
    getCssProperty(
        "palette-primary-base-mix15-white",
        palette?.primary?.base &&
            transparentize(0.075, mixWith0ComplementaryColor(0.5, palette?.primary?.base, palette)),
    ),
    getCssProperty(
        "palette-warning-base-t50",
        palette?.warning?.base && transparentize(0.5, palette.warning.base),
    ),
];

const getButtonDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-t25",
        palette?.primary?.base && transparentize(0.25, palette.primary.base),
    ),
    getCssProperty(
        "palette-primary-base-t70",
        palette?.primary?.base && transparentize(0.7, palette.primary.base),
    ),
    getCssProperty(
        "palette-primary-base-t80",
        palette?.primary?.base && transparentize(0.8, palette.primary.base),
    ),
    getCssProperty(
        "palette-primary-base-d12",
        getHigherContrastColor(0.12, palette?.primary?.base, isDarkTheme),
    ),
    getCssProperty(
        "palette-primary-base-d06",
        getHigherContrastColor(0.06, palette?.primary?.base, isDarkTheme),
    ),
    getCssProperty(
        "palette-primary-disabled",
        palette?.primary?.base &&
            transparentize(0.4, getLowerContrastColor(0.12, palette.primary.base, isDarkTheme)),
    ),
    getCssProperty(
        "palette-primary-focus",
        palette?.primary?.base &&
            transparentize(0.4, getLowerContrastColor(0.06, palette.primary.base, isDarkTheme)),
    ),
    getCssProperty(
        "palette-error-disabled",
        palette?.error?.base &&
            transparentize(0.4, getLowerContrastColor(0.2, palette.error.base, isDarkTheme)),
    ),
    getCssProperty(
        "palette-error-focus",
        palette?.error?.base &&
            transparentize(0.4, getLowerContrastColor(0.1, palette.error.base, isDarkTheme)),
    ),
    getCssProperty("palette-error-base-d10", getHigherContrastColor(0.1, palette?.error?.base, isDarkTheme)),
    getCssProperty("palette-error-base-d20", getHigherContrastColor(0.2, palette?.error?.base, isDarkTheme)),

    getCssProperty(
        "palette-success-disabled",
        palette?.success?.base &&
            transparentize(0.5, getLowerContrastColor(0.06, palette.success.base, isDarkTheme)),
    ),
    getCssProperty(
        "palette-success-focus",
        palette?.success?.base &&
            transparentize(0.5, getLowerContrastColor(0.06, palette.success.base, isDarkTheme)),
    ),
    getCssProperty(
        "palette-success-base-d06",
        getHigherContrastColor(0.06, palette?.success?.base, isDarkTheme),
    ),
    getCssProperty(
        "palette-success-base-d12",
        getHigherContrastColor(0.12, palette?.success?.base, isDarkTheme),
    ),
];

const getBubbleDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-t10",
        palette?.primary?.base && transparentize(0.1, palette.primary.base),
    ),
    getCssProperty("palette-error-base-t10", palette?.error?.base && transparentize(0.1, palette.error.base)),
];

const getDateFilterDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-lighten45",
        getLowerContrastColor(0.45, palette?.primary?.base, isDarkTheme),
    ),
];

const getMeasureNumberFormatDialogDerivedColors = (
    palette: IThemePalette,
    isDarkTheme: boolean,
): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-darken20",
        getHigherContrastColor(0.2, palette?.primary?.base, isDarkTheme),
    ),
];

const getPivotTableDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-dimmed-darken03",
        palette?.primary?.base &&
            getHigherContrastColor(
                0.03,
                mixWith0ComplementaryColor(0.1, palette?.primary?.base, palette),
                isDarkTheme,
            ),
    ),
];

const getFormDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): CssProperty[] => [
    getCssProperty("palette-error-base-t50", palette?.error?.base && transparentize(0.5, palette.error.base)),
    getCssProperty(
        "palette-error-base-t70d20",
        palette?.error?.base &&
            transparentize(0.7, getHigherContrastColor(0.2, palette.error.base, isDarkTheme)),
    ),
    getCssProperty(
        "palette-warning-base-t70d20",
        palette?.warning?.base &&
            transparentize(0.7, getHigherContrastColor(0.2, palette.warning.base, isDarkTheme)),
    ),
];

const getComplementaryPaletteDerivedColors = (palette: IThemePalette) => [
    getCssProperty(
        "palette-complementary-0-t50",
        palette?.complementary?.c0 && transparentize(0.5, palette.complementary.c0),
    ),
    getCssProperty(
        "palette-complementary-0-t10",
        palette?.complementary?.c0 && transparentize(0.1, palette.complementary.c0),
    ),
];

/**
 * @internal
 */
export const generateDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): CssProperty[] => {
    if (!palette) {
        return [];
    }

    return [
        ...getCommonDerivedColors(palette, isDarkTheme),
        ...getMessagesDerivedColors(palette),
        ...getDashboardsDerivedColors(palette),
        ...getButtonDerivedColors(palette, isDarkTheme),
        ...getBubbleDerivedColors(palette),
        ...getDateFilterDerivedColors(palette, isDarkTheme),
        ...getMeasureNumberFormatDialogDerivedColors(palette, isDarkTheme),
        ...getPivotTableDerivedColors(palette, isDarkTheme),
        ...getFormDerivedColors(palette, isDarkTheme),
        ...getComplementaryPaletteDerivedColors(palette),
    ].filter((property) => !!property);
};
