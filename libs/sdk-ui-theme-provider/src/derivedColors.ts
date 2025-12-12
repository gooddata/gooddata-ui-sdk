// (C) 2021-2025 GoodData Corporation

import { darken, lighten, mix, setLightness, transparentize } from "polished";

import { type IThemePalette, type ThemeColor } from "@gooddata/sdk-model";

import { type CssProperty, getCssProperty } from "./cssProperty.js";

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

const getCommonDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): (CssProperty | null)[] => [
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-dimmed",
              mixWith0ComplementaryColor(0.1, palette.primary.base, palette),
          )
        : null,
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-dimmed50",
              mixWith0ComplementaryColor(0.5, palette.primary.base, palette),
          )
        : null,
    palette?.primary?.base
        ? getCssProperty("palette-primary-lightest", getLeastContrastColor(palette.primary.base, isDarkTheme))
        : null,
    palette?.error?.base
        ? getCssProperty("palette-error-dimmed", mixWith0ComplementaryColor(0.1, palette.error.base, palette))
        : null,
    palette?.error?.base
        ? getCssProperty("palette-error-lightest", getLeastContrastColor(palette.error.base, isDarkTheme))
        : null,
    palette?.error?.base
        ? getCssProperty(
              "palette-error-dimmed90",
              mixWith0ComplementaryColor(0.9, palette.error.base, palette),
          )
        : null,
    palette?.warning?.base
        ? getCssProperty(
              "palette-warning-dimmed",
              mixWith0ComplementaryColor(0.2, palette.warning.base, palette),
          )
        : null,
    palette?.warning?.base
        ? getCssProperty(
              "palette-warning-dimmed40",
              mixWith8ComplementaryColor(0.4, palette.warning.base, palette),
          )
        : null,
    palette?.warning?.base
        ? getCssProperty(
              "palette-warning-text-dimmed",
              mixWith8ComplementaryColor(0.2, palette.warning.base, palette),
          )
        : null,
    palette?.success?.base
        ? getCssProperty(
              "palette-success-dimmed",
              mixWith0ComplementaryColor(0.1, palette.success.base, palette),
          )
        : null,
];

const getMessagesDerivedColors = (palette: IThemePalette): (CssProperty | null)[] => [
    palette?.primary?.base
        ? getCssProperty("palette-primary-base-t02", transparentize(0.02, palette.primary.base))
        : null,
    palette?.error?.base
        ? getCssProperty("palette-error-base-t02", transparentize(0.02, palette.error.base))
        : null,
    palette?.success?.base
        ? getCssProperty("palette-success-base-t02", transparentize(0.02, palette.success.base))
        : null,
    palette?.error?.base
        ? getCssProperty("palette-error-base-t85", transparentize(0.85, palette.error.base))
        : null,
    palette?.warning?.base
        ? getCssProperty("palette-warning-base-t85", transparentize(0.85, palette.warning.base))
        : null,
    palette?.info?.base
        ? getCssProperty("palette-info-base-t85", transparentize(0.85, palette.info.base))
        : null,
    palette?.info?.base
        ? getCssProperty("palette-info-base-t02", transparentize(0.02, palette.info.base))
        : null,
    palette?.success?.base
        ? getCssProperty("palette-success-base-t85", transparentize(0.85, palette.success.base))
        : null,
];

const getDashboardsDerivedColors = (palette: IThemePalette): (CssProperty | null)[] => [
    palette?.primary?.base
        ? getCssProperty("palette-primary-base-t50", transparentize(0.5, palette.primary.base))
        : null,
    palette?.primary?.base
        ? getCssProperty("palette-primary-base-t85", transparentize(0.85, palette.primary.base))
        : null,
    palette?.primary?.base
        ? getCssProperty("palette-primary-base-t90", transparentize(0.9, palette.primary.base))
        : null,
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-base-mix15-white",
              transparentize(0.075, mixWith0ComplementaryColor(0.5, palette.primary.base, palette)),
          )
        : null,
    palette?.warning?.base
        ? getCssProperty("palette-warning-base-t50", transparentize(0.5, palette.warning.base))
        : null,
];

const getButtonDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): (CssProperty | null)[] => [
    palette?.primary?.base
        ? getCssProperty("palette-primary-base-t25", transparentize(0.25, palette.primary.base))
        : null,
    palette?.primary?.base
        ? getCssProperty("palette-primary-base-t70", transparentize(0.7, palette.primary.base))
        : null,
    palette?.primary?.base
        ? getCssProperty("palette-primary-base-t80", transparentize(0.8, palette.primary.base))
        : null,
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-base-d12",
              getHigherContrastColor(0.12, palette.primary.base, isDarkTheme),
          )
        : null,
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-base-d06",
              getHigherContrastColor(0.06, palette.primary.base, isDarkTheme),
          )
        : null,
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-disabled",
              transparentize(0.4, getLowerContrastColor(0.12, palette.primary.base, isDarkTheme)),
          )
        : null,
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-focus",
              transparentize(0.4, getLowerContrastColor(0.06, palette.primary.base, isDarkTheme)),
          )
        : null,
    palette?.error?.base
        ? getCssProperty(
              "palette-error-disabled",
              transparentize(0.4, getLowerContrastColor(0.2, palette.error.base, isDarkTheme)),
          )
        : null,
    palette?.error?.base
        ? getCssProperty(
              "palette-error-focus",
              transparentize(0.4, getLowerContrastColor(0.1, palette.error.base, isDarkTheme)),
          )
        : null,
    palette?.error?.base
        ? getCssProperty(
              "palette-error-base-d10",
              getHigherContrastColor(0.1, palette.error.base, isDarkTheme),
          )
        : null,
    palette?.error?.base
        ? getCssProperty(
              "palette-error-base-d20",
              getHigherContrastColor(0.2, palette.error.base, isDarkTheme),
          )
        : null,

    palette?.success?.base
        ? getCssProperty(
              "palette-success-disabled",
              transparentize(0.5, getLowerContrastColor(0.06, palette.success.base, isDarkTheme)),
          )
        : null,
    palette?.success?.base
        ? getCssProperty(
              "palette-success-focus",
              transparentize(0.5, getLowerContrastColor(0.06, palette.success.base, isDarkTheme)),
          )
        : null,
    palette?.success?.base
        ? getCssProperty(
              "palette-success-base-d06",
              getHigherContrastColor(0.06, palette.success.base, isDarkTheme),
          )
        : null,
    palette?.success?.base
        ? getCssProperty(
              "palette-success-base-d12",
              getHigherContrastColor(0.12, palette.success.base, isDarkTheme),
          )
        : null,
];

const getBubbleDerivedColors = (palette: IThemePalette): (CssProperty | null)[] => [
    palette?.primary?.base
        ? getCssProperty("palette-primary-base-t10", transparentize(0.1, palette.primary.base))
        : null,
    palette?.error?.base
        ? getCssProperty("palette-error-base-t10", transparentize(0.1, palette.error.base))
        : null,
];

const getDateFilterDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): (CssProperty | null)[] => [
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-base-lighten45",
              getLowerContrastColor(0.45, palette.primary.base, isDarkTheme),
          )
        : null,
];

const getMeasureNumberFormatDialogDerivedColors = (
    palette: IThemePalette,
    isDarkTheme: boolean,
): (CssProperty | null)[] => [
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-base-darken20",
              getHigherContrastColor(0.2, palette.primary.base, isDarkTheme),
          )
        : null,
];

const getPivotTableDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): (CssProperty | null)[] => [
    palette?.primary?.base
        ? getCssProperty(
              "palette-primary-base-dimmed-darken03",
              getHigherContrastColor(
                  0.03,
                  mixWith0ComplementaryColor(0.1, palette.primary.base, palette),
                  isDarkTheme,
              ),
          )
        : null,
];

const getFormDerivedColors = (palette: IThemePalette, isDarkTheme: boolean): (CssProperty | null)[] => [
    palette?.error?.base
        ? getCssProperty("palette-error-base-t50", transparentize(0.5, palette.error.base))
        : null,
    palette?.error?.base
        ? getCssProperty(
              "palette-error-base-t70d20",
              transparentize(0.7, getHigherContrastColor(0.2, palette.error.base, isDarkTheme)),
          )
        : null,
    palette?.warning?.base
        ? getCssProperty(
              "palette-warning-base-t70d20",
              transparentize(0.7, getHigherContrastColor(0.2, palette.warning.base, isDarkTheme)),
          )
        : null,
];

const getComplementaryPaletteDerivedColors = (palette: IThemePalette): (CssProperty | null)[] => [
    palette?.complementary?.c0
        ? getCssProperty("palette-complementary-0-t50", transparentize(0.5, palette.complementary.c0))
        : null,
    palette?.complementary?.c0
        ? getCssProperty("palette-complementary-0-t10", transparentize(0.1, palette.complementary.c0))
        : null,
    palette?.complementary?.c5
        ? getCssProperty("palette-complementary-5-t40", transparentize(0.4, palette.complementary.c5))
        : null,
    palette?.complementary?.c9
        ? getCssProperty("palette-complementary-9-t50", transparentize(0.5, palette.complementary.c9))
        : null,
    palette?.complementary?.c9
        ? getCssProperty("palette-complementary-9-t80", transparentize(0.8, palette.complementary.c9))
        : null,
    palette?.complementary?.c9
        ? getCssProperty("palette-complementary-9-t85", transparentize(0.85, palette.complementary.c9))
        : null,
    palette?.complementary?.c9
        ? getCssProperty("palette-complementary-9-t90", transparentize(0.9, palette.complementary.c9))
        : null,
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
    ].filter((property): property is CssProperty => !!property);
};
