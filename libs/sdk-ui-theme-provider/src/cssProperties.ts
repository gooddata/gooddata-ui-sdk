// (C) 2020-2026 GoodData Corporation

import { transparentize } from "polished";

import {
    type ITheme,
    type IThemeComplementaryPalette,
    type IThemeFontsDef,
    type IThemePalette,
    type ThemeFontUri,
} from "@gooddata/sdk-model";

import { type CssProperty, getCssProperty } from "./cssProperty.js";
import { generateDerivedColors } from "./derivedColors.js";
import { themeDefinedCssVariables } from "./variablesSpec/allThemeCssVariables.js";
import { inconsistentVariables } from "./variablesSpec/inconsistent/inconsistent.js";

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
): string {
    const src: IThemeFontsDef[] = Array.isArray(sources) ? sources : [{ font: sources }];

    if (isScoped) {
        if (scopeTo && scopeId) {
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
        return "";
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

    return ""; // empty string values are skipped while generating CSS properties
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
    /**
     * Returns the CSS value, an empty string to emit nothing, or an object to keep descending into.
     */
    fn: (value: any, isScoped?: boolean, scopeTo?: HTMLElement, scopeId?: string) => string | object;
};

// A report page scales with its width, so its lengths are read against that width: a bare number is
// cqw. The units are the ones that follow it — `cqh` and `cqb` are left out although they parse,
// because a page contains its inline axis only and a block unit silently resolves against the
// viewport instead; `px` and `rem` are left out because they hold their size while the page changes.
const REPORT_LENGTH = /^\d+(\.\d+)?(cqw|cqi|em|%)$/;

function reportLength(value: unknown, bare: (n: number) => string): string {
    if (typeof value === "number") {
        return Number.isFinite(value) && value >= 0 ? bare(value) : "";
    }
    if (typeof value !== "string") {
        return "";
    }
    const trimmed = value.trim();
    if (trimmed !== "" && parseFloat(trimmed).toString() === trimmed && parseFloat(trimmed) >= 0) {
        return bare(parseFloat(trimmed));
    }
    return REPORT_LENGTH.test(trimmed) ? trimmed : "";
}

/**
 * @internal
 */
export function handleReportLength(value: unknown): string {
    return reportLength(value, (n) => `${n}cqw`);
}

/**
 * @internal
 */
export function handleReportLineHeight(value: unknown): string {
    // CSS reads a bare line height as a multiple of the font size, which is what anyone writing
    // `1.5` means; reading it as a share of the page width the way a size is read would set a
    // heading's lines closer together than its letters are tall.
    return reportLength(value, (n) => `${n}`);
}

const REPORT_TEXT_LEVELS = [
    ...["h1", "h2", "h3", "h4", "h5", "h6"].map((level) => `heading-${level}`),
    ...["largeText", "normalText", "smallText"].map((level) => `paragraph-${level}`),
];

const reportLengthParserFunctions: ParserFunction[] = [
    ...REPORT_TEXT_LEVELS.map((level) => ({
        key: `--gd-reports-textStyle-${level}-fontSize`,
        fn: handleReportLength,
    })),
    ...[
        "--gd-reports-textStyle-lineHeight",
        "--gd-reports-textStyle-heading-lineHeight",
        "--gd-reports-textStyle-paragraph-lineHeight",
        ...REPORT_TEXT_LEVELS.map((level) => `--gd-reports-textStyle-${level}-lineHeight`),
    ].map((key) => ({ key, fn: handleReportLineHeight })),
];

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
    { key: "--gd-button-textCapitalization", fn: (value: boolean) => (value ? "capitalize" : "none") },
    { key: "--gd-button-dropShadow", fn: (value: boolean) => (value ? "var(--gd-shadow-default)" : "none") },
    { key: "--gd-dashboards-content-widget-borderWidth", fn: handleUnits },
    { key: "--gd-dashboards-content-widget-borderRadius", fn: handleUnits },
    {
        key: "--gd-dashboards-content-widget-dropShadow",
        fn: (value: boolean) => (value ? DEFAULT_WIDGET_SHADOW : "none"),
    },
    { key: "--gd-modal-borderRadius", fn: handleUnits },
    { key: "--gd-modal-borderWidth", fn: handleUnits },
    { key: "--gd-modal-dropShadow", fn: (value: boolean) => (value ? "var(--gd-shadow-default)" : "none") },
    // Toast message border width
    { key: "--gd-toastMessage-information-borderWidth", fn: handleUnits },
    { key: "--gd-toastMessage-success-borderWidth", fn: handleUnits },
    { key: "--gd-toastMessage-warning-borderWidth", fn: handleUnits },
    { key: "--gd-toastMessage-error-borderWidth", fn: handleUnits },
    // Toast message border radius
    { key: "--gd-toastMessage-information-borderRadius", fn: handleUnits },
    { key: "--gd-toastMessage-success-borderRadius", fn: handleUnits },
    { key: "--gd-toastMessage-warning-borderRadius", fn: handleUnits },
    { key: "--gd-toastMessage-error-borderRadius", fn: handleUnits },
    // Message border width
    { key: "--gd-message-information-borderWidth", fn: handleUnits },
    { key: "--gd-message-success-borderWidth", fn: handleUnits },
    { key: "--gd-message-warning-borderWidth", fn: handleUnits },
    { key: "--gd-message-error-borderWidth", fn: handleUnits },
    // Message border radius
    { key: "--gd-message-information-borderRadius", fn: handleUnits },
    { key: "--gd-message-success-borderRadius", fn: handleUnits },
    { key: "--gd-message-warning-borderRadius", fn: handleUnits },
    { key: "--gd-message-error-borderRadius", fn: handleUnits },
    // Toast message drop shadow
    { key: "--gd-toastMessage-information-dropShadow", fn: (value: boolean) => (value ? "initial" : "none") },
    { key: "--gd-toastMessage-success-dropShadow", fn: (value: boolean) => (value ? "initial" : "none") },
    { key: "--gd-toastMessage-warning-dropShadow", fn: (value: boolean) => (value ? "initial" : "none") },
    { key: "--gd-toastMessage-error-dropShadow", fn: (value: boolean) => (value ? "initial" : "none") },
    { key: "--gd-message-information-dropShadow", fn: (value: boolean) => (value ? "initial" : "none") },
    // Message drop shadow
    {
        key: "--gd-message-success-dropShadow",
        fn: (value: boolean) => (value ? "initial" : "none"),
    },
    { key: "--gd-message-warning-dropShadow", fn: (value: boolean) => (value ? "initial" : "none") },
    { key: "--gd-message-error-dropShadow", fn: (value: boolean) => (value ? "initial" : "none") },
    { key: "--gd-dashboards-content-kpiWidget-borderWidth", fn: handleUnits },
    { key: "--gd-dashboards-content-kpiWidget-borderRadius", fn: handleUnits },
    {
        key: "--gd-dashboards-content-kpiWidget-dropShadow",
        fn: (value: boolean) => (value ? DEFAULT_WIDGET_SHADOW : "none"),
    },
    { key: "--gd-palette-complementary", fn: () => "" },
    // Not CSS: the content version, the image assets and the font files are read by the reports
    // application from the theme object itself.
    { key: "--gd-version", fn: () => "" },
    { key: "--gd-assets", fn: () => "" },
    { key: "--gd-reports-textStyle-typography-fonts", fn: () => "" },
    // Inline colors become indexed variables; a palette reference is resolved by the application.
    { key: "--gd-reports-visualizationPalette", fn: (value: unknown) => (Array.isArray(value) ? value : "") },
    ...reportLengthParserFunctions,
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
            if (newValue !== null && typeof newValue === "object") {
                cssProperties.push(
                    ...parseThemeToCssProperties(
                        newValue as ITheme,
                        parserFunctions,
                        newKey,
                        isScoped,
                        scopeTo,
                        scopeId,
                    ),
                );
            } else if (newValue !== "") {
                cssProperties.push({ key: newKey, value: newValue });
            }
        }
    }

    return cssProperties;
}

const generateComplementaryPalette = (palette: IThemePalette): CssProperty[] => {
    if (!palette?.complementary) {
        return [];
    }

    return Object.keys(palette.complementary)
        .map((key, index) => {
            const value = palette.complementary![key as keyof IThemeComplementaryPalette];
            return value ? getCssProperty(`palette-complementary-${index}`, value) : null;
        })
        .filter((property): property is CssProperty => !!property);
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
                : transparentize(0.8, palette.complementary?.c8 || DEFAULT_SHADOW_COLOR),
        ),
    ].filter((property) => !!property);
};

export const clearCssProperties = (isScoped?: boolean, scopeTo?: HTMLElement, scopeId?: string): void => {
    if (isScoped) {
        if (scopeTo) {
            scopeTo.removeAttribute("style");
        }

        if (scopeId) {
            const scopedFontElement = document.getElementById(scopeId);
            if (scopedFontElement) {
                document.head.removeChild(scopedFontElement);
            }
        }

        return;
    }

    const themePropertiesElement = document.getElementById("gdc-theme-properties");
    if (themePropertiesElement) {
        document.head.removeChild(themePropertiesElement);
    }

    const customFontElement = document.getElementById("gdc-theme-custom-font");
    if (customFontElement) {
        document.head.removeChild(customFontElement);
    }
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
        ...(theme.palette ? generateComplementaryPalette(theme.palette) : []),
        ...(theme.palette ? generateDerivedColors(theme.palette, isDarkTheme) : []),
        ...(theme.palette ? generateShadowColor(theme.palette, isDarkTheme) : []),
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
        // Doubled `:root` (specificity 0,2,0) so the theme always wins over the plain `:root {}`
        // light defaults shipped in every app's compiled CSS — regardless of DOM order. In the
        // pluggable host, hovering a header item preloads an app whose bundle injects those defaults
        // into <head> *after* this tag; at equal specificity the later rule would win and reset the
        // theme (LX-2608). The higher specificity makes the outcome order-independent.
        styleTag.appendChild(
            document.createTextNode(`
                :root:root {
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
            `${hasFont && scopeId ? "--gd-font-family: " + scopeId + ";" : ""} ${cssPropertiesRules}\ncolor-scheme: ${
                isDarkTheme ? "dark" : "light"
            };`,
        );
    }
}
