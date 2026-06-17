// (C) 2021-2026 GoodData Corporation

import { getContrast, shade } from "polished";

import { type ITheme, type IThemeColorFamily, type IThemeComplementaryPalette } from "@gooddata/sdk-model";

import { isValidThemeColor } from "../colorValidation.js";
import { getComplementaryPalette } from "../complementaryPalette.js";

/**
 * Minimum contrast ratio n:1 recommended by W3C
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
const MIN_CONTRAST_RATIO = 3;

const DEFAULT_BACKGROUND_COLOR = "#fff";

const DEFAULT_PRIMARY = "#14b2e2";
const DEFAULT_SUCCESS = "#00c18d";
const DEFAULT_ERROR = "#e54d42";
const DEFAULT_WARNING = "#f18600";

type FamilyKey = "primary" | "error" | "warning" | "success" | "info";

const sanitizeColorFamily = (family: IThemeColorFamily): IThemeColorFamily | undefined => {
    // without a usable base the whole family is dropped, so a default base is supplied downstream
    if (!isValidThemeColor(family.base)) {
        return undefined;
    }

    const sanitized: IThemeColorFamily = { base: family.base };
    (["light", "dark", "contrast"] as const).forEach((key) => {
        const value = family[key];
        if (value !== undefined && isValidThemeColor(value)) {
            sanitized[key] = value;
        }
    });

    return sanitized;
};

const sanitizeComplementaryPalette = (
    complementary: IThemeComplementaryPalette,
): IThemeComplementaryPalette => {
    const sanitized: Partial<IThemeComplementaryPalette> = {};
    (Object.keys(complementary) as (keyof IThemeComplementaryPalette)[]).forEach((key) => {
        const value = complementary[key];
        if (value !== undefined && isValidThemeColor(value)) {
            sanitized[key] = value;
        }
    });

    return sanitized as IThemeComplementaryPalette;
};

/**
 * Drops palette colors that the `polished` color functions cannot parse.
 *
 * @remarks
 * A single invalid color (e.g. a typo like "#1616D") would otherwise make theme application throw.
 * An invalid color is treated exactly like an omitted one: it is removed so the standard default
 * applies (missing shades are interpolated, missing family/complementary colors fall back to the
 * default theme), while every other valid color is preserved. A color family whose base is invalid
 * is dropped as a whole, since the family is meaningless without a base. The try/catch in
 * ThemeProvider remains the hard backstop for any color path not covered here.
 */
export const sanitizePalette = (theme: ITheme): ITheme => {
    if (!theme?.palette) {
        return theme;
    }

    const palette = { ...theme.palette };

    const families: FamilyKey[] = ["primary", "error", "warning", "success", "info"];
    families.forEach((key) => {
        const family = palette[key];
        if (family === undefined) {
            return;
        }
        const sanitized = sanitizeColorFamily(family);
        if (sanitized) {
            palette[key] = sanitized;
        } else {
            delete palette[key];
        }
    });

    if (palette.complementary) {
        palette.complementary = sanitizeComplementaryPalette(palette.complementary);
    }

    return { ...theme, palette };
};

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
    if (theme?.palette?.complementary) {
        return {
            ...theme,
            palette: {
                ...theme.palette,
                ...(theme.palette.primary ? {} : { primary: { base: DEFAULT_PRIMARY } }),
                ...(theme.palette.success ? {} : { success: { base: DEFAULT_SUCCESS } }),
                ...(theme.palette.error ? {} : { error: { base: DEFAULT_ERROR } }),
                ...(theme.palette.warning ? {} : { warning: { base: DEFAULT_WARNING } }),
            },
        };
    }

    return theme;
};

export const stripComplementaryPalette = (theme: ITheme): ITheme => {
    const strippedTheme = {
        ...theme,
    };

    if (strippedTheme?.palette?.complementary) {
        delete strippedTheme.palette.complementary;
    }
    if (strippedTheme?.chart) {
        delete strippedTheme.chart;
    }
    if (strippedTheme?.table) {
        delete strippedTheme.table;
    }

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
    const sanitizedTheme = sanitizePalette(theme);

    if (!enableComplementaryPalette) {
        const themeWithContrastPrimaryColor = preparePrimaryColor(sanitizedTheme);
        return stripComplementaryPalette(themeWithContrastPrimaryColor);
    }

    const themeWithComplementaryPalette = prepareComplementaryPalette(sanitizedTheme);
    return prepareBaseColors(themeWithComplementaryPalette);
};
