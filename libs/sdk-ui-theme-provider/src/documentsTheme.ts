// (C) 2026 GoodData Corporation

import { type ITheme, getPublisherThemeReferencePathV2 } from "@gooddata/sdk-model";

// Document lengths are px on the page canvas, emitted bare for the renderer to scale. A value that
// starts like a number without being one carries a unit, which documents do not accept.
const NUMBER = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const NUMBER_START = /^[+-]?\.?\d/;

// Keys and color ids become parts of variable names; the grammar is the v2 validator's theme name.
const NAME = /^[A-Za-z0-9_-]+$/;

// Only values of these shapes are emitted: anything else could end the declaration, or the rule holding
// every theme variable. Theme references and font families are checked on their own.
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB_COLOR = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:\d+(?:\.\d+)?|\.\d+)\s*)?\)$/;
const KEYWORD = /^[a-zA-Z][a-zA-Z0-9-]*$/;
const PLAIN_VALUES = [NUMBER, HEX_COLOR, RGB_COLOR, KEYWORD];

// A quoted name holds no backslash or line break, so each quote closes where it appears to.
const FONT_FAMILY_NAME = String.raw`(?:"[^"\\\n\r\f]*"|'[^'\\\n\r\f]*'|[\p{L}\p{N}_ -]+)`;
const FONT_FAMILY = new RegExp(String.raw`^${FONT_FAMILY_NAME}(?:\s*,\s*${FONT_FAMILY_NAME})*$`, "u");

const COLOR_LISTS = ["backgrounds", "texts", "lines"] as const;

type ColorList = (typeof COLOR_LISTS)[number];

// The renderer resolves these even when the theme leaves them out.
const BUILT_IN_COLOR_IDS: Record<ColorList, string[]> = {
    backgrounds: ["default", "surface", "inverse", "accent"],
    texts: ["default", "muted", "inverse", "accent"],
    lines: ["default", "accent"],
};

const PALETTE_NAMES = ["primary", "success", "error", "warning"];
const SPACING_KINDS = ["gap", "padding"];
const SPACING_STEPS = ["compact", "normal", "spacious"];
// `full` is built in: the renderer resolves it and the theme never sets it.
const CORNER_STEPS = ["small", "medium", "large", "full"];

// Images are resolved by the application from the theme object, like the font files.
const IMAGE_KEYS = ["backgroundImage"];

// Never lengths: ids, palette references and font faces would only raise false warnings.
const NOT_LENGTH_KEYS = ["id", "visualizationPalette", "fonts", ...IMAGE_KEYS];

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isColorList(value: string | undefined): value is ColorList {
    return (COLOR_LISTS as readonly (string | undefined)[]).includes(value);
}

function isLengthWithUnit(value: string): boolean {
    return NUMBER_START.test(value) && !NUMBER.test(value);
}

function themeColorIds(documents: Record<string, unknown>, list: ColorList): string[] {
    const colors = isObject(documents["colors"]) ? documents["colors"][list] : undefined;
    if (!Array.isArray(colors)) {
        return [];
    }
    return colors.flatMap((entry) =>
        isObject(entry) && typeof entry["id"] === "string" && NAME.test(entry["id"]) ? [entry["id"]] : [],
    );
}

// A reference becomes the variable of the value it names, and only when that variable exists.
function themeReferenceCss(value: string, documents: Record<string, unknown>): string {
    const [group, name, step, ...rest] = getPublisherThemeReferencePathV2(value) ?? [];
    if (rest.length > 0 || name === undefined) {
        return "";
    }
    if (group === "palette" && step === undefined && PALETTE_NAMES.includes(name)) {
        return `var(--gd-palette-${name}-base)`;
    }
    if (
        group === "colors" &&
        isColorList(name) &&
        step !== undefined &&
        (BUILT_IN_COLOR_IDS[name].includes(step) || themeColorIds(documents, name).includes(step))
    ) {
        return `var(--gd-documents-colors-${name}-${step})`;
    }
    if (
        group === "spacing" &&
        SPACING_KINDS.includes(name) &&
        step !== undefined &&
        SPACING_STEPS.includes(step)
    ) {
        return `var(--gd-documents-spacing-${name}-${step})`;
    }
    if (group === "corners" && step === undefined && CORNER_STEPS.includes(name)) {
        return `var(--gd-documents-corners-${name})`;
    }
    return "";
}

function cssValue(value: unknown, documents: Record<string, unknown>): string {
    if (typeof value === "number") {
        return Number.isFinite(value) ? `${value}` : "";
    }
    if (typeof value !== "string") {
        return "";
    }
    const trimmed = value.trim();
    if (trimmed.startsWith("{")) {
        return themeReferenceCss(trimmed, documents);
    }
    return PLAIN_VALUES.some((pattern) => pattern.test(trimmed)) ? trimmed : "";
}

function fontFamilyCss(value: unknown): string {
    if (typeof value !== "string") {
        return "";
    }
    const trimmed = value.trim();
    return FONT_FAMILY.test(trimmed) ? trimmed : "";
}

function cssValues(value: unknown, documents: Record<string, unknown>): unknown {
    if (!isObject(value)) {
        return cssValue(value, documents);
    }
    return Object.fromEntries(
        Object.entries(value)
            .filter(([key]) => NAME.test(key) && !IMAGE_KEYS.includes(key))
            .map(([key, item]) => [key, cssValues(item, documents)]),
    );
}

// Content refers to a color by its id, so each list is emitted by id; the first entry of an id wins.
function colorsById(list: unknown, documents: Record<string, unknown>): Record<string, string> {
    const byId: Record<string, string> = {};
    if (!Array.isArray(list)) {
        return byId;
    }
    for (const entry of list) {
        if (!isObject(entry)) {
            continue;
        }
        const id = entry["id"];
        if (typeof id === "string" && NAME.test(id) && !Object.prototype.hasOwnProperty.call(byId, id)) {
            byId[id] = cssValue(entry["color"], documents);
        }
    }
    return byId;
}

/**
 * The theme's documents section as the values of its CSS variables.
 *
 * @internal
 */
export function documentsThemeCssValues(documents: unknown): object | "" {
    if (!isObject(documents)) {
        return "";
    }
    const { colors, textStyle, ...rest } = documents;
    const { typography, ...textLevels } = isObject(textStyle) ? textStyle : {};
    const palette = isObject(colors) ? colors["visualizationPalette"] : undefined;
    return {
        ...(cssValues(rest, documents) as object),
        colors: {
            ...Object.fromEntries(
                COLOR_LISTS.map((list) => [
                    list,
                    colorsById(isObject(colors) ? colors[list] : undefined, documents),
                ]),
            ),
            // Inline colors become indexed variables; a palette reference is resolved by the application.
            visualizationPalette: Array.isArray(palette)
                ? palette.map((color) => cssValue(color, documents))
                : "",
        },
        textStyle: {
            ...(cssValues(textLevels, documents) as object),
            // Font files are registered by the application.
            typography: {
                fontFamily: isObject(typography) ? fontFamilyCss(typography["fontFamily"]) : "",
            },
        },
    };
}

/**
 * The paths in the documents section where a length is written with a unit, which documents ignore.
 *
 * @internal
 */
export function findDocumentLengthsWithUnits(theme: ITheme | undefined): string[] {
    const paths: string[] = [];
    const visit = (value: unknown, path: string): void => {
        if (typeof value === "string") {
            if (isLengthWithUnit(value.trim())) {
                paths.push(path);
            }
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => visit(item, `${path}.${index}`));
        } else if (isObject(value)) {
            for (const [key, item] of Object.entries(value)) {
                if (!NOT_LENGTH_KEYS.includes(key)) {
                    visit(item, `${path}.${key}`);
                }
            }
        }
    };
    visit(theme?.documents, "documents");
    return paths;
}
