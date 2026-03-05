// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { parseArbitraryValues } from "../parseArbitraryValues.js";

const EMPTY_VALUE = "(empty value)";

describe("parseArbitraryValues", () => {
    it("should parse comma-separated values", () => {
        expect(parseArbitraryValues("Berlin, Prague, Brno", EMPTY_VALUE)).toEqual([
            "Berlin",
            "Prague",
            "Brno",
        ]);
    });

    it("should parse newline-separated values", () => {
        expect(parseArbitraryValues("Berlin\nPrague\nBrno", EMPTY_VALUE)).toEqual([
            "Berlin",
            "Prague",
            "Brno",
        ]);
    });

    it("should parse mixed comma and newline separators", () => {
        expect(parseArbitraryValues("Berlin, Prague\nBrno", EMPTY_VALUE)).toEqual([
            "Berlin",
            "Prague",
            "Brno",
        ]);
    });

    it("should support double-quoted values with commas", () => {
        expect(parseArbitraryValues('Berlin, "Prague, Brno", Vienna', EMPTY_VALUE)).toEqual([
            "Berlin",
            "Prague, Brno",
            "Vienna",
        ]);
    });

    it("should convert empty value display to null", () => {
        expect(parseArbitraryValues("Berlin, (empty value), Prague", EMPTY_VALUE)).toEqual([
            "Berlin",
            null,
            "Prague",
        ]);
    });

    it("should convert explicit empty quotes to empty string", () => {
        expect(parseArbitraryValues('Berlin, "", Prague', EMPTY_VALUE)).toEqual(["Berlin", "", "Prague"]);
    });

    it("should handle standalone explicit empty quotes", () => {
        expect(parseArbitraryValues('""', EMPTY_VALUE)).toEqual([""]);
    });

    it("should handle empty quotes at end of input", () => {
        expect(parseArbitraryValues('Berlin, ""', EMPTY_VALUE)).toEqual(["Berlin", ""]);
    });

    it("should trim whitespace", () => {
        expect(parseArbitraryValues("  Berlin  ,  Prague  ", EMPTY_VALUE)).toEqual(["Berlin", "Prague"]);
    });

    it("should return empty array for empty input", () => {
        expect(parseArbitraryValues("", EMPTY_VALUE)).toEqual([]);
        expect(parseArbitraryValues("   ", EMPTY_VALUE)).toEqual([]);
    });
});
