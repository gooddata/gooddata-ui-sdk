// (C) 2021-2022 GoodData Corporation
import { ITheme } from "@gooddata/sdk-model";
import { getContrast, shade } from "polished";
import { getComplementaryPalette } from "../complementaryPalette.js";

/**
 * Minimum contrast ratio n:1 recommended by W3C
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
const MIN_CONTRAST_RATIO = 3;

const DEFAULT_BACKGROUND_COLOR = "#fff";

export const prepareComplementaryPalette = (theme: ITheme): ITheme => {
    if (theme?.palette?.complementary) {
        return {
            ...theme,
            palette: {
                ...theme.palette,
                complementary: getComplementaryPalette(theme.palette.complementary),
            },
        };
    }

    return theme;
};

export const prepareBaseColors = (theme: ITheme): ITheme => {
    const defaultPrimary = "#14b2e2";
    const defaultSuccess = "#00c18d";
    const defaultError = "#e54d42";
    const defaultWarning = "#fada23";

    if (theme?.palette?.complementary) {
        return {
            ...theme,
            palette: {
                ...theme.palette,
                ...(theme.palette.primary ? {} : { primary: { base: defaultPrimary } }),
                ...(theme.palette.success ? {} : { success: { base: defaultSuccess } }),
                ...(theme.palette.error ? {} : { error: { base: defaultError } }),
                ...(theme.palette.warning ? {} : { warning: { base: defaultWarning } }),
            },
        };
    }

    return theme;
};

export const stripComplementaryPalette = (theme: ITheme): ITheme => {
    const strippedTheme = {
        ...theme,
    };

    strippedTheme?.palette?.complementary && delete strippedTheme.palette.complementary;
    strippedTheme?.chart && delete strippedTheme.chart;
    strippedTheme?.table && delete strippedTheme.table;

    return strippedTheme;
};

export const preparePrimaryColor = (theme: ITheme): ITheme => {
    const primaryColor = theme?.palette?.primary?.base;

    if (!theme?.palette?.complementary || !primaryColor) {
        return theme;
    }

    let contrastPrimaryColor = primaryColor;
    while (getContrast(contrastPrimaryColor, DEFAULT_BACKGROUND_COLOR) < MIN_CONTRAST_RATIO) {
        contrastPrimaryColor = shade(0.05, contrastPrimaryColor);
    }

    return {
        ...theme,
        palette: {
            ...theme.palette,
            primary: {
                ...theme.palette.primary,
                ...{ base: contrastPrimaryColor },
            },
        },
    };
};

export const prepareTheme = (theme: ITheme, enableComplementaryPalette = true): ITheme => {
    if (!enableComplementaryPalette) {
        const themeWithContrastPrimaryColor = preparePrimaryColor(theme);
        return stripComplementaryPalette(themeWithContrastPrimaryColor);
    }

    const themeWithComplementaryPalette = prepareComplementaryPalette(theme);
    return prepareBaseColors(themeWithComplementaryPalette);
};
