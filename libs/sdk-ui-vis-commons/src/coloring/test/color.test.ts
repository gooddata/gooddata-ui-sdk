// (C) 2020-2021 GoodData Corporation

import { IRgbColorValue } from "@gooddata/sdk-model";
import { normalizeColorToRGB, parseRGBString } from "../color.js";
import { describe, it, expect } from "vitest";

describe("parseRGBString", () => {
    const Scenarios: Array<[string, IRgbColorValue | null]> = [
        ["aslkdj", null],
        ["", null],
        [5 as any, null],
        ["rgb(155, 220, 14)", { r: 155, g: 220, b: 14 }],
        ["rgb(155.5, 220.6, 14.1)", { r: 155, g: 220, b: 14 }],
        ["#ff00ff", { r: 255, g: 0, b: 255 }],
        ["#ff0", { r: 255, g: 255, b: 0 }],
    ];

    it.each(Scenarios)("should parse '%s' to rgb '%s'", (input, expected) => {
        expect(parseRGBString(input)).toEqual(expected);
    });
});

describe("normalizeColorToRGB", () => {
    const Scenarios: Array<[string, string]> = [
        ["#fff", "rgb(255,255,255)"],
        ["#ffffff", "rgb(255,255,255)"],
        ["rgb(255, 255, 255)", "rgb(255,255,255)"],
        ["rgb(255,255,255)", "rgb(255,255,255)"],
        ["#00ffff", "rgb(0,255,255)"],
        ["#0ff", "rgb(0,255,255)"],
    ];

    it.each(Scenarios)("should parse hex '%s' to rgb '%s'", (input, expected) => {
        expect(normalizeColorToRGB(input)).toEqual(expected);
    });
});
