// (C) 2020-2025 GoodData Corporation
import isObject from "lodash/isObject.js";
import { transparentize } from "polished";
import {
    IThemePalette,
    ITheme,
    IThemeComplementaryPalette,
    ThemeFontUri,
    IThemeFontsDef,
} from "@gooddata/sdk-model";
import { CssProperty, getCssProperty } from "./cssProperty.js";
import { generateDerivedColors } from "./derivedColors.js";
import { inconsistentVariables } from "./variablesSpec/inconsistent/inconsistent.js";
import { themeDefinedCssVariables } from "./variablesSpec/allThemeCssVariables.js";

// keep it in sync with SCSS:$gd-color-text-light
const DEFAULT_SHADOW_COLOR = "rgba(20, 56, 93, 0.2)";
const DEFAULT_WIDGET_SHADOW = `1px 2px 8px var(--gd-shadow-color, ${DEFAULT_SHADOW_COLOR})`;
const BLACK_COLOR = "#000";

/**
 *
 * @param sources - Font src
 * @param weight - Weight of font
 * @param isScoped - If the font is scoped
 * @param scopeTo - The element to which the font is scoped
 * @param scopeId - The id of the element to which the font is scoped
 */
function createFontFace(
    sources: IThemeFontsDef[] | ThemeFontUri,
    weight: number,
    isScoped?: boolean,
    scopeTo?: HTMLElement,
    scopeId?: string,
): undefined {
    const src: IThemeFontsDef[] = Array.isArray(sources) ? sources : [{ font: sources }];

    if (isScoped) {
        if (scopeTo) {
            const styleTag = document.getElementById(scopeId) || document.createElement("style");
            styleTag.id = scopeId;

            src.forEach((font) => {
                styleTag.appendChild(
                    document.createTextNode(`
                        @font-face {
                            font-family: ${scopeId};
                            src: ${font.font};
                            font-weight: ${weight};
                            ${font.unicodeRange ? `unicode-range: ${font.unicodeRange};` : ""}
                        }
                    `),
                );
            });

            document.head.appendChild(styleTag);
        }
        return undefined;
    }
    const styleTag = document.getElementById("gdc-theme-custom-font") || document.createElement("style");
    styleTag.id = "gdc-theme-custom-font";

    src.forEach((font) => {
        styleTag.appendChild(
            document.createTextNode(`
                        @font-face {
                            font-family: GDCustomFont;
                            src: ${font.font};
                            font-weight: ${weight};
                            ${font.unicodeRange ? `unicode-range: ${font.unicodeRange};` : ""}
                        }
                    `),
        );
    });

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
    fn: (value: any, isScoped?: boolean, scopeTo?: HTMLElement, scopeId?: string) => string;
};

const customParserFunctions: ParserFunction[] = [
    {
        key: "--gd-typography-font",
        fn: (
            value: IThemeFontsDef[] | ThemeFontUri,
            isScoped?: boolean,
            scopeTo?: HTMLElement,
            scopeId?: string,
        ) => {
            return createFontFace(value, 400, isScoped, scopeTo, scopeId);
        },
    },
    {
        key: "--gd-typography-fontBold",
        fn: (
            value: IThemeFontsDef[] | ThemeFontUri,
            isScoped?: boolean,
            scopeTo?: HTMLElement,
            scopeId?: string,
        ) => {
            return createFontFace(value, 700, isScoped, scopeTo, scopeId);
        },
    },
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
    isScoped?: boolean,
    scopeTo?: HTMLElement,
    scopeId?: string,
): CssProperty[] {
    const cssProperties: CssProperty[] = [];
    for (const [key, value] of Object.entries(object)) {
        const newKey = `${currentKey}-${key}`;

        const parse = parserFunctions.find((exception) => exception.key === newKey);
        const newValue = parse ? parse.fn(value, isScoped, scopeTo, scopeId) : value;

        if (newValue !== undefined) {
            if (isObject(newValue)) {
                cssProperties.push(
                    ...parseThemeToCssProperties(
                        newValue,
                        parserFunctions,
                        newKey,
                        isScoped,
                        scopeTo,
                        scopeId,
                    ),
                );
            } else {
                const parse = parserFunctions.find((exception) => exception.key === newKey);
                const newValue = parse ? parse.fn(value, isScoped, scopeTo, scopeId) : value;
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

export const clearCssProperties = (isScoped?: boolean, scopeTo?: HTMLElement, scopeId?: string): void => {
    if (isScoped) {
        if (scopeTo) {
            scopeTo.removeAttribute("style");
        }

        const scopedFontElement = document.getElementById(scopeId);
        scopedFontElement && document.head.removeChild(scopedFontElement);

        return;
    }

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
export function setCssProperties(
    theme: ITheme,
    isDarkTheme: boolean,
    isScoped: boolean = false,
    scopeTo?: HTMLElement,
    scopeId?: string,
): void {
    let cssProperties = [
        ...generateComplementaryPalette(theme.palette),
        ...generateDerivedColors(theme.palette, isDarkTheme),
        ...generateShadowColor(theme.palette, isDarkTheme),
        ...parseThemeToCssProperties(theme, customParserFunctions, undefined, isScoped, scopeTo, scopeId),
    ];

    // Add fallbacks for variables with inconsistent values
    cssProperties = cssProperties.flatMap((property) => {
        const propertiesWithFallbacks = [property];

        if (inconsistentVariables.some((v) => v.variableName.replace("-from-theme", "") === property.key)) {
            propertiesWithFallbacks.push({
                key: `${property.key}-from-theme`,
                value: `var(${property.key})`,
            });
        }

        return propertiesWithFallbacks;
    });

    if (!isScoped) {
        const cssPropertiesRules = cssProperties.map(({ key, value }) => `${key}: ${value};`).join("");
        const styleTag = document.createElement("style");
        styleTag.id = "gdc-theme-properties";
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
    if (isScoped && scopeTo) {
        const defaultsToJoin = themeDefinedCssVariables.map(({ variableName, defaultValue }) => ({
            key: variableName as string,
            value: defaultValue,
        }));
        const cssPropertiesRules = defaultsToJoin
            .concat(cssProperties)
            .map(({ key, value }) => `${key}: ${value};`)
            .join(" ");
        const hasFont = theme.typography?.font;
        scopeTo.setAttribute(
            "style",
            `${hasFont ? "--gd-font-family: " + scopeId + ";" : ""} ${cssPropertiesRules}\ncolor-scheme: ${
                isDarkTheme ? "dark" : "light"
            };`,
        );
    }
}
