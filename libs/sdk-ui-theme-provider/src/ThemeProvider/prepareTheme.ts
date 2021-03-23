// (C) 2021 GoodData Corporation
import { ITheme } from "@gooddata/sdk-backend-spi";
import { getComplementaryPalette } from "../complementaryPalette";

const prepareComplementaryPalette = (theme: ITheme): ITheme => {
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

const stripComplementaryPalette = (theme: ITheme): ITheme => {
    const strippedTheme = {
        ...theme,
    };

    delete strippedTheme.palette.complementary;
    delete strippedTheme.chart;

    return strippedTheme;
};

export const prepareTheme = (theme: ITheme, enableComplementaryPalette = true): ITheme => {
    if (!enableComplementaryPalette) {
        return stripComplementaryPalette(theme);
    }

    const themeWithComplementaryPalette = {
        ...theme,
        ...prepareComplementaryPalette(theme),
    };

    const themeWithBaseColors = {
        ...themeWithComplementaryPalette,
        ...prepareBaseColors(themeWithComplementaryPalette),
    };

    return themeWithBaseColors;
};
