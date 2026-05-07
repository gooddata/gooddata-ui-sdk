// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { generateTitleFromQuestion } from "../utils.js";

describe("generateTitleFromQuestion", () => {
    it("should return trimmed original text when text length is up to 50 characters", () => {
        expect(generateTitleFromQuestion("   short question   ")).toBe("short question");
    });

    it("should truncate to 50 characters and append ellipsis when text is longer", () => {
        const input = `${"a".repeat(50)}extra`;

        expect(generateTitleFromQuestion(input)).toBe(`${"a".repeat(50)}...`);
    });

    it("should extend truncation to the end of reference when cutoff falls inside a reference", () => {
        const prefix = "x".repeat(48);
        const input = `${prefix}{metric/revenue} trailing text`;

        expect(generateTitleFromQuestion(input)).toBe(`${prefix}{metric/revenue}...`);
    });

    it("should extend truncation to nearest closing brace when unmatched reference-like token is cut", () => {
        const prefix = "x".repeat(48);
        const input = `${prefix}{metric/} trailing text`;

        expect(generateTitleFromQuestion(input)).toBe(`${prefix}{metric/}...`);
    });
});
