// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IColorPickerValue,
    areColorPickerValuesEqual,
    canApplyColorPickerValueWhileTyping,
    colorPickerValueFromRgb,
    colorPickerValueFromWheel,
    colorPickerValueToRgba,
    colorPickerValueToWheel,
    formatColorPickerValue,
    parseColorPickerValue,
} from "./colorValue.js";

const RED: IColorPickerValue = { h: 0, s: 1, l: 0.5, alpha: 1 };

describe("colorPickerValueFromRgb", () => {
    it("reads channels and takes an absent opacity as full", () => {
        expect(colorPickerValueFromRgb({ r: 255, g: 0, b: 0 })).toEqual(RED);
    });

    it("reads the opacity a color carries", () => {
        expect(colorPickerValueFromRgb({ r: 255, g: 0, b: 0, a: 0.4 })).toEqual({ ...RED, alpha: 0.4 });
    });
});

describe("colorPickerValueToRgba", () => {
    it("reports channels with the opacity alongside", () => {
        expect(colorPickerValueToRgba({ ...RED, alpha: 0.25 })).toEqual({ r: 255, g: 0, b: 0, a: 0.25 });
    });

    it("comes back close to, but not exactly, the color it went out as", () => {
        const value = { h: 210, s: 0.5, l: 0.15, alpha: 1 };
        const back = colorPickerValueFromRgb(colorPickerValueToRgba(value));
        expect(back.h).toBeCloseTo(value.h, 1);
        expect(back.s).toBeCloseTo(value.s, 2);
        expect(back.l).toBeCloseTo(value.l, 2);
        expect(back).not.toEqual(value);
    });
});

describe("areColorPickerValuesEqual", () => {
    it("compares the color, not the way it is stated", () => {
        expect(areColorPickerValuesEqual(RED, { h: 360, s: 1, l: 0.5, alpha: 1 })).toBe(true);
        expect(areColorPickerValuesEqual(RED, { ...RED, alpha: 0.5 })).toBe(false);
        expect(areColorPickerValuesEqual(RED, { ...RED, l: 0.6 })).toBe(false);
    });

    it("treats hues that render the same as the same", () => {
        expect(
            areColorPickerValuesEqual({ h: 0, s: 0, l: 1, alpha: 1 }, { h: 200, s: 0, l: 1, alpha: 1 }),
        ).toBe(true);
    });
});

describe("formatColorPickerValue", () => {
    it("writes an opaque color in the three notations", () => {
        expect(formatColorPickerValue(RED, "hex")).toBe("#ff0000");
        expect(formatColorPickerValue(RED, "rgb")).toBe("rgb(255, 0, 0)");
        expect(formatColorPickerValue(RED, "hsl")).toBe("hsl(0, 100%, 50%)");
    });

    it("states the opacity only where there is one to state", () => {
        const translucent = { ...RED, alpha: 0.5 };
        expect(formatColorPickerValue(translucent, "hex")).toBe("#ff000080");
        expect(formatColorPickerValue(translucent, "rgb")).toBe("rgba(255, 0, 0, 0.5)");
        expect(formatColorPickerValue(translucent, "hsl")).toBe("hsla(0, 100%, 50%, 0.5)");
    });
});

describe("parseColorPickerValue", () => {
    it("reads every notation it writes", () => {
        expect(parseColorPickerValue("#ff0000", RED)).toEqual(RED);
        expect(parseColorPickerValue("rgb(255, 0, 0)", RED)).toEqual(RED);
        expect(parseColorPickerValue("hsl(0, 100%, 50%)", RED)).toEqual(RED);
        expect(parseColorPickerValue("  #FF0000  ", RED)).toEqual(RED);
    });

    it("reads an opacity", () => {
        expect(parseColorPickerValue("rgba(255, 0, 0, 0.5)", RED)).toEqual({ ...RED, alpha: 0.5 });
    });

    it("keeps the current hue for a color that states none", () => {
        const working = { h: 210, s: 0.5, l: 0.5, alpha: 1 };
        expect(parseColorPickerValue("#808080", working)).toEqual({
            h: 210,
            s: 0,
            l: 0.5019607843137255,
            alpha: 1,
        });
    });

    it("reports nothing for text that is not a color", () => {
        expect(parseColorPickerValue("", RED)).toBeUndefined();
        expect(parseColorPickerValue("#12", RED)).toBeUndefined();
        expect(parseColorPickerValue("not a color", RED)).toBeUndefined();
    });
});

describe("canApplyColorPickerValueWhileTyping", () => {
    it("takes a whole color in every notation the field offers", () => {
        expect(canApplyColorPickerValueWhileTyping("#12263a")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("12263a")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("#12263a80")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("12263a80")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("rgb(18, 38, 58)")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("rgba(18, 38, 58, 0.5)")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("hsl(210, 53%, 15%)")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("hsla(210, 53%, 15%, 0.5)")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("  #12263a  ")).toBe(true);
        expect(canApplyColorPickerValueWhileTyping("RGB(18,38,58)")).toBe(true);
    });

    it("holds back a hex that a longer hex could still be growing into", () => {
        expect(canApplyColorPickerValueWhileTyping("#123")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("#1226")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("123")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("1234")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("12263a8")).toBe(false);
    });

    it("holds back a function notation that has not been closed", () => {
        expect(canApplyColorPickerValueWhileTyping("hsl(210, 53%, 1")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("rgb(18, 38, 5")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("rgb(")).toBe(false);
    });

    it("holds back a second notation begun after the first was closed", () => {
        expect(canApplyColorPickerValueWhileTyping("rgb(1, 2, 3) rgb(4, 5, 6)")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("rgb(1, 2, 3) rgb(")).toBe(false);
    });

    it("holds back a named color", () => {
        expect(canApplyColorPickerValueWhileTyping("red")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("blue")).toBe(false);
        expect(canApplyColorPickerValueWhileTyping("blueviolet")).toBe(false);
    });
});

describe("the wheel", () => {
    it("reads the angle as hue and the distance from the middle as saturation", () => {
        expect(colorPickerValueFromWheel({ x: 1, y: 0 }, RED)).toMatchObject({ h: 0, s: 1 });
        expect(colorPickerValueFromWheel({ x: 0, y: 1 }, RED)).toMatchObject({ h: 90, s: 1 });
        expect(colorPickerValueFromWheel({ x: -1, y: 0 }, RED)).toMatchObject({ h: 180, s: 1 });
        expect(colorPickerValueFromWheel({ x: 0, y: -1 }, RED)).toMatchObject({ h: 270, s: 1 });
        expect(colorPickerValueFromWheel({ x: 0, y: 0 }, RED)).toMatchObject({ s: 0 });
    });

    it("keeps the hue for the exact middle, which points nowhere", () => {
        const working = { h: 210, s: 0.5, l: 0.5, alpha: 1 };
        expect(colorPickerValueFromWheel({ x: 0, y: 0 }, working)).toEqual({ ...working, s: 0 });
    });

    it("keeps the lightness and opacity a gesture says nothing about", () => {
        const value = { h: 0, s: 1, l: 0.2, alpha: 0.3 };
        expect(colorPickerValueFromWheel({ x: 0, y: 0.5 }, value)).toMatchObject({ l: 0.2, alpha: 0.3 });
    });

    it("clamps a gesture that leaves the wheel instead of dropping it", () => {
        expect(colorPickerValueFromWheel({ x: 3, y: 0 }, RED).s).toBe(1);
    });

    it("puts a value back where the gesture that made it was", () => {
        const point = { x: 0.3, y: -0.6 };
        const back = colorPickerValueToWheel(colorPickerValueFromWheel(point, RED));
        expect(back.x).toBeCloseTo(point.x);
        expect(back.y).toBeCloseTo(point.y);
    });
});
