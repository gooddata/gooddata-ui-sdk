// (C) 2020 GoodData Corporation
import { isObject } from "lodash";
import { transparentize, darken, lighten, mix, setLightness } from "polished";
import { IThemePalette, ITheme } from "@gooddata/sdk-backend-spi";

// keep it in sync with SCSS:$gd-color-text-light
const GD_COLOR_TEXT_LIGHT = "#fff";
const GD_COLOR_STATE_BLANK = "#94a1ad";

/**
 *
 * @param {string} src - Font src
 * @param {string} number - Font weight
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

type CssProperty = {
    key: string;
    value: string;
};

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
    { key: "--gd-button-borderRadius", fn: (value: string) => `${value}px` },
    { key: "--gd-button-textCapitalization", fn: (value: boolean) => (value ? "capitalize" : undefined) },
    { key: "--gd-button-dropShadow", fn: (value: boolean) => (value ? undefined : "none") },
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

        if (isObject(value)) {
            cssProperties.push(...parseThemeToCssProperties(value, parserFunctions, newKey));
        } else {
            const parse = parserFunctions.find((exception) => exception.key === newKey);
            const newValue = parse ? parse.fn(value) : value;
            if (newValue !== undefined) {
                cssProperties.push({ key: newKey, value: newValue });
            }
        }
    }

    return cssProperties;
}

const getCssProperty = (key: string, value: string): CssProperty => ({
    key: `--gd-${key}`,
    value,
});

const getCommonDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty("palette-primary-dimmed", mix(0.1, palette.primary.base, GD_COLOR_TEXT_LIGHT)),
    getCssProperty("palette-primary-dimmed50", mix(0.5, palette.primary.base, GD_COLOR_TEXT_LIGHT)),
    getCssProperty("palette-primary-lightest", setLightness(0.96, palette.primary.base)),
];

const getDashboardsDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty("palette-primary-base-t50", transparentize(0.5, palette.primary.base)),
    getCssProperty("palette-primary-base-t85", transparentize(0.85, palette.primary.base)),
    getCssProperty("palette-primary-base-t90", transparentize(0.9, palette.primary.base)),
    getCssProperty("kpiDashboards-navigation-borderColor-t80", transparentize(0.8, GD_COLOR_STATE_BLANK)),
    getCssProperty(
        "palette-primary-base-mix15-white",
        transparentize(0.075, mix(0.15, palette.primary.base, GD_COLOR_TEXT_LIGHT)),
    ),
];

const getButtonDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty("palette-primary-base-t25", transparentize(0.25, palette.primary.base)),
    getCssProperty("palette-primary-base-t70", transparentize(0.7, palette.primary.base)),
    getCssProperty("palette-primary-base-t80", transparentize(0.8, palette.primary.base)),
    getCssProperty("palette-primary-base-d12", darken(0.12, palette.primary.base)),
    getCssProperty("palette-primary-base-d06", darken(0.06, palette.primary.base)),
    getCssProperty("palette-primary-disabled", transparentize(0.4, lighten(0.12, palette.primary.base))),
    getCssProperty("palette-primary-focus", transparentize(0.4, lighten(0.06, palette.primary.base))),
];

const getBubbleDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty("palette-primary-base-t10", transparentize(0.1, palette.primary.base)),
];

const getDateFilterDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty("palette-primary-base-lighten45", lighten(0.45, palette.primary.base)),
];

const getMeasureNumberFormatDialogDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty("palette-primary-base-darken20", darken(0.2, palette.primary.base)),
];

const getPivotTableDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-dimmed-darken03",
        darken(0.03, mix(0.1, palette.primary.base, GD_COLOR_TEXT_LIGHT)),
    ),
];

const generateDerivedColors = (palette: IThemePalette): CssProperty[] =>
    (palette?.primary?.base && [
        ...getCommonDerivedColors(palette),
        ...getDashboardsDerivedColors(palette),
        ...getButtonDerivedColors(palette),
        ...getBubbleDerivedColors(palette),
        ...getDateFilterDerivedColors(palette),
        ...getMeasureNumberFormatDialogDerivedColors(palette),
        ...getPivotTableDerivedColors(palette),
    ]) ||
    [];

const clearCssProperties = () => {
    const themePropertiesElement = document.getElementById("gdc-theme-properties");
    themePropertiesElement && themePropertiesElement.remove();

    const customFontElement = document.getElementById("gdc-theme-custom-font");
    customFontElement && customFontElement.remove();
};

/**
 * Converts properties from theme object into CSS variables and injects them into <body>
 *
 * The CSS variable name is defined as a path through the theme object to the given value, e.g.:
 * {
 *      palette: {
 *          primary: {
 *              base: #14b2e2;
 *          }
 *      }
 * }
 * is converted to "palette-primary-base" variable with value #14b2e2
 *
 * @beta
 */
export function setCssProperties(theme: ITheme): void {
    clearCssProperties();

    const cssProperties = [
        ...parseThemeToCssProperties(theme, customParserFunctions),
        ...generateDerivedColors(theme.palette),
    ];

    const styleTag = document.createElement("style");
    styleTag.id = "gdc-theme-properties";
    styleTag.appendChild(
        document.createTextNode(`
            :root {
                ${cssProperties.map(({ key, value }) => `${key}: ${value};`).join("")}
            }
        `),
    );
    document.head.appendChild(styleTag);
}
