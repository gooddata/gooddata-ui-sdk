// (C) 2020-2021 GoodData Corporation
import isObject from "lodash/isObject";
import { transparentize, darken, lighten, mix, setLightness } from "polished";
import { IThemePalette, ITheme, IThemeChart } from "@gooddata/sdk-backend-spi";

// keep it in sync with SCSS:$gd-color-text-light
const GD_COLOR_TEXT_LIGHT = "#fff";
const GD_COLOR_TEXT = "#464e56";
const DEFAULT_WIDGET_SHADOW = "1px 2px 8px rgba(20, 56, 93, 0.2)";

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

export function handleUnits(value: string): string {
    if (value !== undefined && value !== "NaN") {
        // just number
        if (parseFloat(value).toString() === value) {
            return `${value}px`;
        }
    }
    return value;
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

const getCssProperty = (key: string, value: string): CssProperty =>
    value && {
        key: `--gd-${key}`,
        value,
    };

const getCommonDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-dimmed",
        palette?.primary?.base && mix(0.1, palette.primary.base, GD_COLOR_TEXT_LIGHT),
    ),
    getCssProperty(
        "palette-primary-dimmed50",
        palette?.primary?.base && mix(0.5, palette.primary.base, GD_COLOR_TEXT_LIGHT),
    ),
    getCssProperty(
        "palette-primary-lightest",
        palette?.primary?.base && setLightness(0.96, palette.primary.base),
    ),
    getCssProperty(
        "palette-error-dimmed",
        palette?.error?.base && mix(0.1, palette.error.base, GD_COLOR_TEXT_LIGHT),
    ),
    getCssProperty("palette-error-lightest", palette?.error?.base && setLightness(0.96, palette.error.base)),
    getCssProperty(
        "palette-error-dimmed90",
        palette?.error?.base && mix(0.9, palette.error.base, GD_COLOR_TEXT_LIGHT),
    ),
    getCssProperty(
        "palette-warning-dimmed",
        palette?.warning?.base && mix(0.2, palette.warning.base, GD_COLOR_TEXT_LIGHT),
    ),
    getCssProperty(
        "palette-warning-dimmed40",
        palette?.warning?.base && mix(0.4, palette.warning.base, GD_COLOR_TEXT),
    ),
    getCssProperty(
        "palette-warning-text-dimmed",
        palette?.warning?.base && mix(0.2, palette.warning.base, GD_COLOR_TEXT),
    ),
    getCssProperty(
        "palette-success-dimmed",
        palette?.success?.base && mix(0.1, palette.success.base, GD_COLOR_TEXT_LIGHT),
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
        palette?.primary?.base && transparentize(0.075, mix(0.15, palette.primary.base, GD_COLOR_TEXT_LIGHT)),
    ),
    getCssProperty(
        "palette-warning-base-t50",
        palette?.warning?.base && transparentize(0.5, palette.warning.base),
    ),
];

const getButtonDerivedColors = (palette: IThemePalette): CssProperty[] => [
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
    getCssProperty("palette-primary-base-d12", palette?.primary?.base && darken(0.12, palette.primary.base)),
    getCssProperty("palette-primary-base-d06", palette?.primary?.base && darken(0.06, palette.primary.base)),
    getCssProperty(
        "palette-primary-disabled",
        palette?.primary?.base && transparentize(0.4, lighten(0.12, palette.primary.base)),
    ),
    getCssProperty(
        "palette-primary-focus",
        palette?.primary?.base && transparentize(0.4, lighten(0.06, palette.primary.base)),
    ),
    getCssProperty(
        "palette-error-disabled",
        palette?.error?.base && transparentize(0.4, lighten(0.2, palette.error.base)),
    ),
    getCssProperty(
        "palette-error-focus",
        palette?.error?.base && transparentize(0.4, lighten(0.1, palette.error.base)),
    ),
    getCssProperty("palette-error-base-d10", palette?.error?.base && darken(0.1, palette.error.base)),
    getCssProperty("palette-error-base-d20", palette?.error?.base && darken(0.2, palette.error.base)),

    getCssProperty(
        "palette-success-disabled",
        palette?.success?.base && transparentize(0.5, lighten(0.06, palette.success.base)),
    ),
    getCssProperty(
        "palette-success-focus",
        palette?.success?.base && transparentize(0.5, lighten(0.06, palette.success.base)),
    ),
    getCssProperty("palette-success-base-d06", palette?.success?.base && darken(0.06, palette.success.base)),
    getCssProperty("palette-success-base-d12", palette?.success?.base && darken(0.12, palette.success.base)),
];

const getBubbleDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-t10",
        palette?.primary?.base && transparentize(0.1, palette.primary.base),
    ),
    getCssProperty("palette-error-base-t10", palette?.error?.base && transparentize(0.1, palette.error.base)),
];

const getDateFilterDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-lighten45",
        palette?.primary?.base && lighten(0.45, palette.primary.base),
    ),
];

const getMeasureNumberFormatDialogDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-darken20",
        palette?.primary?.base && darken(0.2, palette.primary.base),
    ),
];

const getPivotTableDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty(
        "palette-primary-base-dimmed-darken03",
        palette?.primary?.base && darken(0.03, mix(0.1, palette.primary.base, GD_COLOR_TEXT_LIGHT)),
    ),
];

const getFormDerivedColors = (palette: IThemePalette): CssProperty[] => [
    getCssProperty("palette-error-base-t50", palette?.error?.base && transparentize(0.5, palette.error.base)),
    getCssProperty(
        "palette-error-base-t70d20",
        palette?.error?.base && transparentize(0.7, darken(0.2, palette.error.base)),
    ),
    getCssProperty(
        "palette-warning-base-t70d20",
        palette?.warning?.base && transparentize(0.7, darken(0.2, palette.warning.base)),
    ),
];

const getChartDerivedColors = (chart: IThemeChart): CssProperty[] => [
    getCssProperty(
        "chart-backgroundColor-base-t05",
        chart?.backgroundColor?.base && transparentize(0.05, chart?.backgroundColor?.base),
    ),
];

const generateDerivedColors = (palette: IThemePalette): CssProperty[] =>
    (palette &&
        [
            ...getCommonDerivedColors(palette),
            ...getMessagesDerivedColors(palette),
            ...getDashboardsDerivedColors(palette),
            ...getButtonDerivedColors(palette),
            ...getBubbleDerivedColors(palette),
            ...getDateFilterDerivedColors(palette),
            ...getMeasureNumberFormatDialogDerivedColors(palette),
            ...getPivotTableDerivedColors(palette),
            ...getFormDerivedColors(palette),
        ].filter((property) => !!property)) ||
    [];

const generateChartDerivedColors = (chart: IThemeChart): CssProperty[] =>
    (chart && [...getChartDerivedColors(chart)].filter((property) => !!property)) || [];

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
 * {
 *      palette: {
 *          primary: {
 *              base: #14b2e2;
 *          }
 *      }
 * }
 * is converted to "palette-primary-base" variable with value #14b2e2
 *
 * @internal
 */
export function setCssProperties(theme: ITheme): void {
    const cssProperties = [
        ...parseThemeToCssProperties(theme, customParserFunctions),
        ...generateDerivedColors(theme.palette),
        ...generateChartDerivedColors(theme.chart),
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
