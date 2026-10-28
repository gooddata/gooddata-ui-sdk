// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITheme } from "@gooddata/sdk-model";

import { parseThemeToCssProperties } from "./cssProperties.js";
import {
    documentsThemeCssValues,
    findDocumentLengthsWithUnits,
    isDocumentsThemeColorSet,
} from "./documentsTheme.js";

// Theme files are written by hand, so the values are typed loosely on purpose.
const themeWith = (documents: unknown) => ({ documents }) as ITheme;

const documentsVariables = (documents: unknown): Record<string, string> =>
    Object.fromEntries(
        parseThemeToCssProperties(themeWith(documents), [
            { key: "--gd-documents", fn: documentsThemeCssValues },
        ]).map(({ key, value }) => [key, value]),
    );

const takeawayVariable = (key: string, value: unknown): string | undefined =>
    documentsVariables({
        colors: { backgrounds: [{ id: "brand-blue", color: "#0000ff" }] },
        takeaway: { [key]: value },
    })[`--gd-documents-takeaway-${key}`];

const fontFamilyVariable = (fontFamily: string): string | undefined =>
    documentsVariables({ textStyle: { typography: { fontFamily } } })[
        "--gd-documents-textStyle-typography-fontFamily"
    ];

describe("documentsThemeCssValues", () => {
    it("emits each color list by id, the first entry of an id winning", () => {
        const variables = documentsVariables({
            colors: {
                texts: [
                    { id: "brand", color: "#ff0000" },
                    { id: "brand-blue", color: "#0000ff" },
                    { id: "brand", color: "#00ff00" },
                    { id: "2024", color: "rgb(1, 2, 3)" },
                ],
                lines: [{ id: "brand blue", color: "#000000" }, { color: "#000000" }],
            },
        });

        expect(variables).toEqual({
            "--gd-documents-colors-texts-brand": "#ff0000",
            "--gd-documents-colors-texts-brand-blue": "#0000ff",
            "--gd-documents-colors-texts-2024": "rgb(1, 2, 3)",
        });
    });

    it("emits inline visualization colors by position and leaves a palette reference to the application", () => {
        expect(
            documentsVariables({
                colors: { visualizationPalette: ["#ff0000", "{theme.palette.primary}", "red;"] },
            }),
        ).toEqual({
            "--gd-documents-colors-visualizationPalette-0": "#ff0000",
            "--gd-documents-colors-visualizationPalette-1": "var(--gd-palette-primary-base)",
        });
        expect(documentsVariables({ colors: { visualizationPalette: { id: "brand" } } })).toEqual({});
    });

    it.each([
        ["backgroundColor", "{theme.palette.primary}", "var(--gd-palette-primary-base)"],
        ["backgroundColor", "{theme.palette.info}", "var(--gd-palette-info-base)"],
        ["backgroundColor", "{theme.palette.complementary.c0}", "var(--gd-palette-complementary-0)"],
        ["borderColor", "{theme.palette.complementary.c9}", "var(--gd-palette-complementary-9)"],
        [
            "backgroundColor",
            "{theme.colors.backgrounds.surface}",
            "var(--gd-documents-colors-backgrounds-surface)",
        ],
        [
            "backgroundColor",
            "{theme.colors.backgrounds.brand-blue}",
            "var(--gd-documents-colors-backgrounds-brand-blue)",
        ],
        ["padding", "{theme.spacing.padding.spacious}", "var(--gd-documents-spacing-padding-spacious)"],
        ["borderRadius", "{theme.corners.large}", "var(--gd-documents-corners-large)"],
        ["borderRadius", "{theme.corners.full}", "var(--gd-documents-corners-full)"],
    ])("resolves %s %s to the variable of the value it names", (key, reference, expected) => {
        expect(takeawayVariable(key, reference)).toBe(expected);
    });

    it.each([
        "{theme.palette.primary.base}",
        "{theme.palette.error.light}",
        "{theme.palette.warning.contrast}",
        "{theme.palette.complementary.c10}",
        "{theme.palette.complementary}",
        "{theme.colors.backgrounds.unknown}",
        "{theme.colors.shades.default}",
        "{theme.spacing.padding.huge}",
        "{theme.corners.round}",
        "{theme.corners.large.extra}",
        "{theme.shadows.card}",
        "{theme.palette.primary",
    ])("emits nothing for %s, which names no value", (reference) => {
        expect(takeawayVariable("backgroundColor", reference)).toBeUndefined();
    });

    it("emits lengths bare and drops lengths with units", () => {
        expect(takeawayVariable("fontSize", 12)).toBe("12");
        expect(takeawayVariable("padding", "16")).toBe("16");
        expect(takeawayVariable("lineHeight", 1.5)).toBe("1.5");
        expect(takeawayVariable("borderWidth", "2px")).toBeUndefined();
        expect(takeawayVariable("letterSpacing", ".5em")).toBeUndefined();
    });

    it.each([
        ["borderStyle", "dashed"],
        ["textTransform", "uppercase"],
        ["borderColor", "#ABCDEF80"],
        ["textColor", "rgb(0, 0, 0, 0.5)"],
    ])("emits %s %s as written", (key, value) => {
        expect(takeawayVariable(key, value)).toBe(value);
    });

    it("leaves images to the application", () => {
        expect(takeawayVariable("backgroundImage", "{theme.assets.images.cover}")).toBeUndefined();
    });

    it.each(["red; --gd-button-borderRadius: 0", "#fff}", "/*", '"unclosed', "red\\", "rgba(0, 0, 0, 0.5)"])(
        "emits nothing for %j, which is no documents value",
        (value) => {
            expect(takeawayVariable("textColor", value)).toBeUndefined();
        },
    );

    it.each(["Inter, sans-serif", `"Source Sans 3", 'Noto Sans' , sans-serif`, "游ゴシック, serif"])(
        "emits the font family %j as written",
        (fontFamily) => {
            expect(fontFamilyVariable(fontFamily)).toBe(fontFamily);
        },
    );

    it.each([
        '"Inter, sans-serif',
        "Inter\\",
        "Inter /* note */",
        "Inter; color: red",
        '"Sans\nSerif", serif',
        "Inter, {theme.palette.primary}",
    ])("emits nothing for the font family %j, which could break the rule", (fontFamily) => {
        expect(fontFamilyVariable(fontFamily)).toBeUndefined();
    });

    it("names variables after keys that hold dashes or start with a digit, and skips other keys", () => {
        const variables = documentsVariables({
            shadows: {
                "card-raised": { blur: 4, color: "#000000" },
                "2xl": { blur: 8 },
                "card raised": { blur: 1 },
                "card.raised": { blur: 1 },
            },
        });

        expect(variables).toEqual({
            "--gd-documents-shadows-card-raised-blur": "4",
            "--gd-documents-shadows-card-raised-color": "#000000",
            "--gd-documents-shadows-2xl-blur": "8",
        });
    });
});

describe("findDocumentLengthsWithUnits", () => {
    it("lists the paths of lengths with units, skipping keys that hold no lengths", () => {
        const theme = themeWith({
            takeaway: {
                fontSize: "12px",
                padding: 16,
                borderRadius: "{theme.corners.small}",
                backgroundImage: "2x.png",
            },
            colors: { texts: [{ id: "2024px", color: "#000000" }], visualizationPalette: ["1px"] },
            textStyle: {
                typography: {
                    fonts: [{ family: "Brand", url: "https://example.com/brand.woff2", weight: "400 700" }],
                },
            },
            shadows: { card: { blur: " 4pt " } },
        });

        expect(findDocumentLengthsWithUnits(theme)).toEqual([
            "documents.takeaway.fontSize",
            "documents.shadows.card.blur",
        ]);
    });

    it("lists nothing without a documents section", () => {
        expect(findDocumentLengthsWithUnits(undefined)).toEqual([]);
        expect(findDocumentLengthsWithUnits({ palette: { primary: { base: "#14b2e2" } } })).toEqual([]);
    });
});

describe("isDocumentsThemeColorSet", () => {
    const backgrounds = (entries: unknown[]) => themeWith({ colors: { backgrounds: entries } });

    it.each([
        ["a hex color", "#ff0000"],
        ["a CSS keyword", "red"],
        ["a value with spaces around it", " #ff0000 "],
        ["a reference to a color the theme writes", "{theme.colors.backgrounds.other}"],
        ["a palette reference", "{theme.palette.primary}"],
    ])("is set for a color written as %s", (_, color) => {
        const theme = backgrounds([
            { id: "brand", color },
            { id: "other", color: "#000000" },
        ]);

        expect(isDocumentsThemeColorSet(theme, "backgrounds", "brand")).toBe(true);
    });

    it.each([
        ["no value", undefined],
        ["a reference to a color the theme does not have", "{theme.colors.backgrounds.nope}"],
        ["a value that could end the declaration", "red; color: blue"],
    ])("is not set for a color with %s", (_, color) => {
        expect(isDocumentsThemeColorSet(backgrounds([{ id: "brand", color }]), "backgrounds", "brand")).toBe(
            false,
        );
    });

    it("agrees with the variables the provider writes", () => {
        const entries = [
            { id: "keyword", color: "transparent" },
            { id: "chain", color: "{theme.colors.backgrounds.nope}" },
            { id: "empty", color: "" },
        ];
        const variables = documentsVariables({ colors: { backgrounds: entries } });

        for (const { id } of entries) {
            expect(isDocumentsThemeColorSet(backgrounds(entries), "backgrounds", id)).toBe(
                variables[`--gd-documents-colors-backgrounds-${id}`] !== undefined,
            );
        }
    });

    it("reads a color from the first entry of its id", () => {
        const theme = backgrounds([{ id: "late" }, { id: "late", color: "#ffffff" }]);

        expect(isDocumentsThemeColorSet(theme, "backgrounds", "late")).toBe(false);
    });

    it("is not set for a theme id without a documents section", () => {
        expect(isDocumentsThemeColorSet(undefined, "backgrounds", "brand")).toBe(false);
        expect(isDocumentsThemeColorSet({}, "backgrounds", "brand")).toBe(false);
    });

    it("is set for a built-in id the theme leaves out or restates without a value", () => {
        expect(isDocumentsThemeColorSet(undefined, "texts", "muted")).toBe(true);
        expect(isDocumentsThemeColorSet(backgrounds([{ id: "accent" }]), "backgrounds", "accent")).toBe(true);
    });

    it.each([
        ["an id another list has", "texts", "brand"],
        ["an unknown list", "shades", "brand"],
        ["an id an object has by default", "backgrounds", "constructor"],
        ["an id outside the name grammar", "backgrounds", "brand blue"],
    ])("is not set for %s", (_, list, id) => {
        const theme = backgrounds([
            { id: "brand", color: "#ff0000" },
            { id: "brand blue", color: "#0000ff" },
        ]);

        expect(isDocumentsThemeColorSet(theme, list, id)).toBe(false);
    });
});
