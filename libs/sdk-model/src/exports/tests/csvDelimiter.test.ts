// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    getCsvDelimiterPreset,
    getCsvDelimiterState,
    getCsvDelimiterValidationError,
    getCsvDelimiterValue,
} from "../csvDelimiter.js";

describe("getCsvDelimiterPreset", () => {
    const Scenarios: Array<[string, string | undefined, string]> = [
        ["undefined", undefined, "inherit"],
        ["empty string", "", "inherit"],
        ["comma", ",", "comma"],
        ["semicolon", ";", "semicolon"],
        ["pipe", "|", "pipe"],
        ["tab", "\t", "tab"],
        ["custom character", "#", "custom"],
    ];

    it.each(Scenarios)("resolves %s to %s", (_desc, delimiter, expected) => {
        expect(getCsvDelimiterPreset(delimiter)).toBe(expected);
    });
});

describe("getCsvDelimiterValue", () => {
    it("returns undefined for the inherit preset", () => {
        expect(getCsvDelimiterValue("inherit", "")).toBeUndefined();
    });

    it("returns the custom delimiter as-is for the custom preset", () => {
        expect(getCsvDelimiterValue("custom", "#")).toBe("#");
    });

    it("returns the built-in character for a preset id", () => {
        expect(getCsvDelimiterValue("comma", "")).toBe(",");
        expect(getCsvDelimiterValue("tab", "")).toBe("\t");
    });
});

describe("getCsvDelimiterState", () => {
    it("maps undefined to the inherit preset with no custom delimiter", () => {
        expect(getCsvDelimiterState(undefined)).toEqual({ selectedPreset: "inherit", customDelimiter: "" });
    });

    it("maps a built-in character to its preset with no custom delimiter", () => {
        expect(getCsvDelimiterState(",")).toEqual({ selectedPreset: "comma", customDelimiter: "" });
    });

    it("maps an unrecognized character to the custom preset carrying that character", () => {
        expect(getCsvDelimiterState("#")).toEqual({ selectedPreset: "custom", customDelimiter: "#" });
    });
});

describe("getCsvDelimiterValidationError", () => {
    it("rejects empty and multi-character values", () => {
        expect(getCsvDelimiterValidationError("")).toBe("singleCharacter");
        expect(getCsvDelimiterValidationError("ab")).toBe("singleCharacter");
    });

    it("rejects characters outside the supported set", () => {
        expect(getCsvDelimiterValidationError("a")).toBe("unsupportedCharacter");
    });

    it("accepts a supported single character", () => {
        expect(getCsvDelimiterValidationError("#")).toBeUndefined();
    });
});
