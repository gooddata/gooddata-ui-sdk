// (C) 2021-2026 GoodData Corporation

import { getContrast } from "polished";
import { describe, expect, it } from "vitest";

import { type ITheme } from "@gooddata/sdk-model";

import {
    prepareBaseColors,
    prepareComplementaryPalette,
    preparePrimaryColor,
    prepareTheme,
    sanitizePalette,
    stripComplementaryPalette,
} from "../prepareTheme.js";

describe("prepareTheme", () => {
    it("should prepare the theme", () => {
        const theme: ITheme = {
            palette: {
                error: { base: "#f00", contrast: "#0ff" },
                complementary: { c0: "#fff", c9: "#000" },
            },
        };

        expect(prepareTheme(theme)).toMatchSnapshot();
    });
});

describe("prepareComplementaryPalette", () => {
    it.each([[{ c0: "#fff", c9: "#000" }], [{ c0: "#fff", c6: "#14b2e2", c9: "#000" }]])(
        "should complete the complementary palette with missing shades",
        (complementaryPalette) => {
            const theme: ITheme = {
                palette: {
                    complementary: complementaryPalette,
                },
            };

            expect(prepareComplementaryPalette(theme)).toMatchSnapshot();
        },
    );
});

describe("prepareBaseColors", () => {
    it("should fill the base colors if complementary palette is provided, but base colors are missing", () => {
        const theme: ITheme = {
            palette: {
                error: { base: "#f00", contrast: "#0ff" },
                complementary: { c0: "#fff", c9: "#000" },
            },
        };

        const expectedTheme: ITheme = {
            palette: {
                primary: { base: "#14b2e2" },
                warning: { base: "#f18600" },
                success: { base: "#00c18d" },
                error: { base: "#f00", contrast: "#0ff" },
                complementary: { c0: "#fff", c9: "#000" },
            },
        };

        expect(prepareBaseColors(theme)).toEqual(expectedTheme);
    });
});

describe("stripComplementaryPalette", () => {
    it("should return theme without complementary palette, chart and pivot table properties", () => {
        const theme: ITheme = {
            palette: {
                complementary: { c0: "#fff", c9: "#000" },
            },
            chart: {
                backgroundColor: "#fff",
            },
            table: {
                backgroundColor: "#fff",
            },
        };

        const strippedTheme = stripComplementaryPalette(theme);

        expect(strippedTheme.palette?.complementary).toEqual(undefined);
        expect(strippedTheme.chart).toEqual(undefined);
        expect(strippedTheme.table).toEqual(undefined);
    });
});

describe("preparePrimaryColor", () => {
    it.each([["#f00"], ["#0f0"], ["#00f"], ["#ccc"], ["#fff"], ["#000"]])(
        "should return theme with contrast primary color",
        (primaryColor) => {
            const theme: ITheme = {
                palette: {
                    primary: { base: primaryColor },
                    complementary: { c0: "#fff", c9: "#000" },
                },
            };

            const strippedTheme = preparePrimaryColor(theme);

            expect(strippedTheme.palette).toBeDefined();
            expect(strippedTheme.palette!.primary).toBeDefined();
            expect(getContrast(strippedTheme.palette!.primary!.base, "#fff") > 3).toEqual(true);
        },
    );
});

describe("sanitizePalette", () => {
    it("should leave a fully valid palette unchanged", () => {
        const theme: ITheme = {
            palette: {
                primary: { base: "#001F5A" },
                complementary: { c0: "#ffffff", c9: "#000C36" },
            },
        };

        expect(sanitizePalette(theme)).toEqual(theme);
    });

    it("should drop an invalid complementary shade and keep the valid ones", () => {
        const theme: ITheme = {
            palette: {
                primary: { base: "#001F5A" },
                complementary: {
                    c0: "#ffffff",
                    c1: "#2662FC",
                    c9: "#1616D", // invalid hex - 5 digits
                },
            },
        };

        const sanitized = sanitizePalette(theme);

        // c9 is removed so the default complementary endpoint applies; valid shades are preserved
        expect(sanitized.palette!.complementary).toEqual({
            c0: "#ffffff",
            c1: "#2662FC",
        });
        expect(sanitized.palette!.primary).toEqual({ base: "#001F5A" });
    });

    it("should drop an invalid intermediate shade so it can be interpolated", () => {
        const theme: ITheme = {
            palette: {
                complementary: { c0: "#fff", c5: "bad", c9: "#000" },
            },
        };

        expect(sanitizePalette(theme).palette!.complementary).toEqual({ c0: "#fff", c9: "#000" });
    });

    it("should drop a whole family when its base is invalid but keep valid optional slots otherwise", () => {
        const theme: ITheme = {
            palette: {
                // invalid base - the family is dropped entirely (a default base is supplied later)
                primary: { base: "bad", light: "#222" },
                // valid base, invalid optional slot - the optional slot is dropped
                error: { base: "#e54d42", contrast: "nope" },
            },
        };

        const sanitized = sanitizePalette(theme);

        expect(sanitized.palette!.primary).toBeUndefined();
        expect(sanitized.palette!.error).toEqual({ base: "#e54d42" });
    });

    it("should not throw and should preserve valid shades when a full palette has one invalid shade", () => {
        const theme: ITheme = {
            palette: {
                primary: { base: "#001F5A" },
                complementary: {
                    c0: "#ffffff",
                    c1: "#2662FC",
                    c2: "#BAD1F5",
                    c3: "#F9F9F9",
                    c4: "#00C2FF",
                    c5: "#000C36",
                    c6: "#082485",
                    c7: "#0F3DB5",
                    c8: "#E7F1FC",
                    c9: "#1616D",
                },
            },
        };

        expect(() => prepareTheme(theme)).not.toThrow();
        const prepared = prepareTheme(theme);
        // the broken endpoint is dropped (falls back to default), every valid shade is preserved
        expect(prepared.palette!.complementary!.c9).toBeUndefined();
        expect(prepared.palette!.complementary!.c1).toEqual("#2662FC");
    });
});
