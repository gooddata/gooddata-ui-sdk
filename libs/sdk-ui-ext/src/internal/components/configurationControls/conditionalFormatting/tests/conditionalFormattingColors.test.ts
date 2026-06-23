// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { colorToHex, hexToColor, rgbToHex } from "../conditionalFormattingColors.js";

describe("rgbToHex", () => {
    it("formats channels as upper-case 2-digit hex", () => {
        expect(rgbToHex({ r: 229, g: 77, b: 64 })).toBe("#E54D40");
        expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
    });

    it("clamps out-of-range channels", () => {
        expect(rgbToHex({ r: 300, g: -5, b: 64 })).toBe("#FF0040");
    });
});

describe("hexToColor", () => {
    it("returns undefined for an absent hex", () => {
        expect(hexToColor(undefined)).toBeUndefined();
    });

    it("maps a preset hex to a palette guid", () => {
        const color = hexToColor("#E54D40");
        expect(color?.type).toBe("guid");
    });

    it("maps a non-preset hex to a raw rgb color", () => {
        expect(hexToColor("#123456")).toEqual({ type: "rgb", value: { r: 18, g: 52, b: 86 } });
    });
});

describe("colorToHex", () => {
    it("resolves a raw rgb color to its hex", () => {
        expect(colorToHex({ type: "rgb", value: { r: 18, g: 52, b: 86 } })).toBe("#123456");
    });

    it("round-trips a preset hex through hexToColor -> colorToHex", () => {
        const color = hexToColor("#3DB36B");
        expect(color).toBeDefined();
        if (color) {
            expect(colorToHex(color)).toBe("#3DB36B");
        }
    });
});
