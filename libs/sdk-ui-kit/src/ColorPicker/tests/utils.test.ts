// (C) 2007-2025 GoodData Corporation

import { CSSProperties } from "react";

import { ColorFormats } from "tinycolor2";
import { describe, expect, it } from "vitest";

import {
    getColorStyle,
    getHexFromHslColor,
    getHslFromHexColor,
    getHslFromRgbColor,
    getRgbFromHslColor,
    isHexColorValid,
    isHslColorBlackOrWhite,
} from "../utils.js";

const redRgb: ColorFormats.RGB = {
    r: 255,
    g: 0,
    b: 0,
};

const redHsl: ColorFormats.HSL = {
    h: 0,
    s: 1,
    l: 0.5,
};

const redHex = "#ff0000";

describe("color conversions", () => {
    it("should return hex color from hsl color", () => {
        const result = getHexFromHslColor(redHsl);

        expect(result).toEqual(redHex);
    });

    it("should return rgb color object from hsl color", () => {
        const result = getRgbFromHslColor(redHsl);

        expect(result).toEqual(redRgb);
    });

    it("should return hsl color object from rgb color", () => {
        const result = getHslFromRgbColor(redRgb);

        expect(result).toEqual(redHsl);
    });

    it("should return hsl color object from hex color", () => {
        const result = getHslFromHexColor(redHex);

        expect(result).toEqual(redHsl);
    });

    describe("#getColorStyle", () => {
        it("should return style with red background color and undefined border color", () => {
            const expectedResult: CSSProperties = {
                backgroundColor: "hsl(0, 100%, 50%)",
                borderColor: undefined,
            };

            const result = getColorStyle(redHsl);

            expect(result).toEqual(expectedResult);
        });

        it("should return style with white background color and solid grey border", () => {
            const whiteHsl: ColorFormats.HSL = {
                h: 0,
                s: 1,
                l: 1,
            };

            const expectedResult: CSSProperties = {
                backgroundColor: "hsl(0, 100%, 100%)",
                borderColor: "#ccc",
            };

            const result = getColorStyle(whiteHsl);

            expect(result).toEqual(expectedResult);
        });
    });

    describe("#isHexColorValid", () => {
        it("should return true if valid hex color is given", () => {
            expect(isHexColorValid(redHex)).toBeTruthy();
        });

        it("should return false if invalid hex color is given", () => {
            expect(isHexColorValid("foo")).toBeFalsy();
        });
    });

    describe("#isHslColorBlackOrWhite", () => {
        it("should return true if color is white", () => {
            const hslColor: ColorFormats.HSL = {
                h: 12,
                s: 1,
                l: 1,
            };

            expect(isHslColorBlackOrWhite(hslColor)).toBeTruthy();
        });

        it("should return true if color is black", () => {
            const hslColor: ColorFormats.HSL = {
                h: 12,
                s: 1,
                l: 0,
            };

            expect(isHslColorBlackOrWhite(hslColor)).toBeTruthy();
        });

        it("should return false if color is not black or white", () => {
            const hslColor: ColorFormats.HSL = {
                h: 12,
                s: 1,
                l: 0.5,
            };

            expect(isHslColorBlackOrWhite(hslColor)).toBeFalsy();
        });
    });
});
