// (C) 2020-2023 GoodData Corporation
import isObject from "lodash/isObject.js";
import { transparentize } from "polished";
import { IThemePalette, ITheme, IThemeComplementaryPalette } from "@gooddata/sdk-model";
import { CssProperty, getCssProperty } from "./cssProperty.js";
import { generateDerivedColors } from "./derivedColors.js";

// keep it in sync with SCSS:$gd-color-text-light
const DEFAULT_SHADOW_COLOR = "rgba(20, 56, 93, 0.2)";
const DEFAULT_WIDGET_SHADOW = `1px 2px 8px var(--gd-shadow-color, ${DEFAULT_SHADOW_COLOR})`;
const BLACK_COLOR = "#000";

/**
 *
 * @param src - Font src
 * @param number - Font weight
 */
function createfontFace(src: string, weight: number): undefined {
    const styleTag = document.getElementById("gdc-theme-custom-font") || document.createElement("style");
    styleTag.id = "gdc-theme-custom-font";
    styleTag.appendChild(
        document.createTextNode(`
            @font-face {
                font-family: GDCustomFont;
                src: ${src};
                font-weight: ${weight};
            }
        `),
    );
    document.head.appendChild(styleTag);

    return undefined; // undefined values are skipped while generating CSS properties
}

export function handleUnits(value: string): string {
    // just number without unit
    if (value !== undefined && value !== "NaN" && parseFloat(value).toString() === value) {
        return `${value}px`;
    }
    return value;
}

/**
 * @internal
 */
export type ParserFunction = {
    key: string;
    fn: (value: any) => string;
};

const customParserFunctions: ParserFunction[] = [
    { key: "--gd-typography-font", fn: (value: string) => createfontFace(value, 400) },
    { key: "--gd-typography-fontBold", fn: (value: string) => createfontFace(value, 700) },
    { key: "--gd-button-borderRadius", fn: handleUnits },
    { key: "--gd-button-textCapitalization", fn: (value: boolean) => (value ? "capitalize" : undefined) },
    { key: "--gd-button-dropShadow", fn: (value: boolean) => (value ? undefined : "none") },
    { key: "--gd-dashboards-content-widget-borderWidth", fn: handleUnits },
    { key: "--gd-dashboards-content-widget-borderRadius", fn: handleUnits },
    {
        key: "--gd-dashboards-content-widget-dropShadow",
        fn: (value: boolean) => (value ? DEFAULT_WIDGET_SHADOW : "none"),
    },
    { key: "--gd-modal-borderRadius", fn: handleUnits },
    { key: "--gd-modal-borderWidth", fn: handleUnits },
    { key: "--gd-modal-dropShadow", fn: (value: boolean) => (value ? undefined : "none") },
    { key: "--gd-dashboards-content-kpiWidget-borderWidth", fn: handleUnits },
    { key: "--gd-dashboards-content-kpiWidget-borderRadius", fn: handleUnits },
    {
        key: "--gd-dashboards-content-kpiWidget-dropShadow",
        fn: (value: boolean) => (value ? DEFAULT_WIDGET_SHADOW : "none"),
    },
    { key: "--gd-palette-complementary", fn: () => undefined },
];

/**
 * @internal
 */
export function parseThemeToCssProperties(
    object: ITheme,
    parserFunctions: ParserFunction[] = [],
    currentKey = "--gd",
): CssProperty[] {
    const cssProperties: CssProperty[] = [];

    for (const [key, value] of Object.entries(object)) {
        const newKey = `${currentKey}-${key}`;

        const parse = parserFunctions.find((exception) => exception.key === newKey);
        const newValue = parse ? parse.fn(value) : value;

        if (newValue !== undefined) {
            if (isObject(newValue)) {
                cssProperties.push(...parseThemeToCssProperties(newValue, parserFunctions, newKey));
            } else {
                const parse = parserFunctions.find((exception) => exception.key === newKey);
                const newValue = parse ? parse.fn(value) : value;
                if (newValue !== undefined) {
                    cssProperties.push({ key: newKey, value: newValue });
                }
            }
        }
    }

    return cssProperties;
}

const generateComplementaryPalette = (palette: IThemePalette): CssProperty[] => {
    if (!palette?.complementary) {
        return [];
    }

    return Object.keys(palette.complementary).map((key: keyof IThemeComplementaryPalette, index) =>
        getCssProperty(`palette-complementary-${index}`, palette.complementary[key]),
    );
};

export const generateShadowColor = (palette: IThemePalette, isDarkTheme: boolean): CssProperty[] => {
    if (!palette?.complementary) {
        return [];
    }

    return [
        getCssProperty(
            "shadow-color",
            isDarkTheme
                ? transparentize(0.5, BLACK_COLOR)
                : transparentize(0.8, palette.complementary?.c8) || DEFAULT_SHADOW_COLOR,
        ),
    ];
};

export const clearCssProperties = (): void => {
    const themePropertiesElement = document.getElementById("gdc-theme-properties");
    themePropertiesElement && document.head.removeChild(themePropertiesElement);

    const customFontElement = document.getElementById("gdc-theme-custom-font");
    customFontElement && document.head.removeChild(customFontElement);
};

/**
 * Converts properties from theme object into CSS variables and injects them into <body>
 *
 * The CSS variable name is defined as a path through the theme object to the given value, e.g.:
 * ```
 * {
 *      palette: {
 *          primary: {
 *              base: #14b2e2;
 *          }
 *      }
 * }
 * ```
 * is converted to "palette-primary-base" variable with value #14b2e2
 *
 * @internal
 */
export function setCssProperties(theme: ITheme, isDarkTheme: boolean): void {
    const cssProperties = [
        ...parseThemeToCssProperties(theme, customParserFunctions),
        ...generateDerivedColors(theme.palette, isDarkTheme),
        ...generateComplementaryPalette(theme.palette),
        ...generateShadowColor(theme.palette, isDarkTheme),
    ];

    const styleTag = document.createElement("style");
    styleTag.id = "gdc-theme-properties";
    const cssPropertiesRules = cssProperties.map(({ key, value }) => `${key}: ${value};`).join("");
    styleTag.appendChild(
        document.createTextNode(`
            :root {
                ${cssPropertiesRules}
                color-scheme: ${isDarkTheme ? "dark" : "light"};
            }
        `),
    );
    document.head.appendChild(styleTag);
}
