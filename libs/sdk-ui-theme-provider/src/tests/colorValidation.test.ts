// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITheme } from "@gooddata/sdk-model";

import { findInvalidThemeColors, isValidThemeColor } from "../colorValidation.js";

describe("isValidThemeColor", () => {
    it.each([
        ["#fff", true],
        ["#ffffff", true],
        ["#ffffffff", true],
        ["#001F5A", true],
        ["rgb(0, 31, 90)", true],
        ["rgba(0, 31, 90, 0.5)", true],
        ["hsl(210, 100%, 18%)", true],
        ["hsla(210, 100%, 18%, 0.5)", true],
        ["red", true],
        // invalid values
        ["#1616D", false], // 5-char hex is invalid - a hex color needs 3, 6 or 8 digits
        ["#12345", false],
        ["#xyz", false],
        ["not-a-color", false],
        ["", false],
        ["   ", false],
    ])("should classify %s as valid=%s", (color, expected) => {
        expect(isValidThemeColor(color)).toBe(expected);
    });

    it.each([[undefined], [null], [42], [{}], [[]]])(
        "should return false for non-string value %s",
        (value) => {
            expect(isValidThemeColor(value)).toBe(false);
        },
    );
});

describe("findInvalidThemeColors", () => {
    it("should return an empty array for a theme with only valid colors", () => {
        const theme: ITheme = {
            palette: {
                primary: { base: "#001F5A" },
                complementary: { c0: "#ffffff", c9: "#000C36" },
            },
        };

        expect(findInvalidThemeColors(theme)).toEqual([]);
    });

    it("should return an empty array when there is no palette", () => {
        expect(findInvalidThemeColors({})).toEqual([]);
        expect(findInvalidThemeColors(undefined)).toEqual([]);
    });

    it("should report a single invalid complementary shade with its path", () => {
        const theme: ITheme = {
            palette: {
                primary: { base: "#001F5A" },
                complementary: {
                    c0: "#ffffff",
                    c1: "#2662FC",
                    c2: "#BAD1F5",
                    c9: "#1616D",
                },
            },
        };

        expect(findInvalidThemeColors(theme)).toEqual([{ path: "complementary.c9", value: "#1616D" }]);
    });

    it("should report invalid colors from both families and complementary palette with their paths", () => {
        const theme: ITheme = {
            palette: {
                primary: { base: "bad", light: "#fff" },
                error: { base: "#f00", contrast: "nope" },
                complementary: { c0: "###", c9: "#000" },
            },
        };

        expect(findInvalidThemeColors(theme)).toEqual([
            { path: "primary.base", value: "bad" },
            { path: "error.contrast", value: "nope" },
            { path: "complementary.c0", value: "###" },
        ]);
    });
});
