// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getPublisherThemePaletteReferenceV2 } from "./paletteReference.js";
import { validatePublisherPageBodyV2 } from "./validation.js";

const FAMILIES = ["primary", "success", "error", "warning", "info"];
const STEPS = ["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"];

const VALID = [
    ...FAMILIES.map((family) => `{theme.palette.${family}}`),
    ...STEPS.map((step) => `{theme.palette.complementary.${step}}`),
];

const INVALID = [
    ...FAMILIES.flatMap((family) =>
        ["light", "dark", "contrast"].map((shade) => `{theme.palette.${family}.${shade}}`),
    ),
    "{theme.palette.primary.base}",
    "{theme.palette.info.base}",
    "{theme.palette.primary.lighter}",
    "{theme.palette.primary.light.dark}",
    "{theme.palette.complementary}",
    "{theme.palette.complementary.c10}",
    "{theme.palette.complementary.c}",
    "{theme.palette.complementary.0}",
    "{theme.palette.complementary.c1.light}",
    "{theme.palette.accent}",
    "{theme.palette.accent.c3}",
    "{theme.palette}",
    "{theme.palette.Primary}",
    "theme.palette.primary",
];

function isValidColor(color: string): boolean {
    return (
        validatePublisherPageBodyV2({ layout: { type: "text", id: "a", style: { textColor: color } } })
            .length === 0
    );
}

describe("getPublisherThemePaletteReferenceV2", () => {
    it.each([
        ["{theme.palette.primary}", { type: "family", family: "primary" }],
        ["{theme.palette.info}", { type: "family", family: "info" }],
        ["{theme.palette.warning}", { type: "family", family: "warning" }],
        ["{theme.palette.complementary.c0}", { type: "complementary", step: "c0" }],
        ["{theme.palette.complementary.c9}", { type: "complementary", step: "c9" }],
    ])("reads %s", (value, reference) => {
        expect(getPublisherThemePaletteReferenceV2(value)).toEqual(reference);
    });

    it.each([...INVALID, "{theme.colors.texts.primary}", 42, undefined])(
        "reads no palette color from %j",
        (value) => {
            expect(getPublisherThemePaletteReferenceV2(value)).toBeUndefined();
        },
    );

    it("reads every one of the 15 palette colors the validator accepts", () => {
        expect(VALID).toHaveLength(15);
        expect(VALID.filter((value) => getPublisherThemePaletteReferenceV2(value) === undefined)).toEqual([]);
    });

    it.each([...VALID, ...INVALID])("validates %s exactly when it reads it", (value) => {
        expect(isValidColor(value)).toBe(getPublisherThemePaletteReferenceV2(value) !== undefined);
    });
});
