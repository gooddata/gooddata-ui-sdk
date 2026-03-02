// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { compareAlphabetically, compareLexicographically } from "../alphabeticalSorting.js";

describe("compareAlphabetically", () => {
    it("compares names case-insensitively", () => {
        expect(compareAlphabetically("beta", "Alpha")).toBeGreaterThan(0);
        expect(compareAlphabetically("BETA", "beta")).toBe(0);
    });

    it("uses numeric ordering semantics", () => {
        expect(compareAlphabetically("item2", "item10")).toBeLessThan(0);
    });
});

describe("compareLexicographically", () => {
    it("compares using strict string ordering", () => {
        expect(compareLexicographically("a/10", "a/2")).toBeLessThan(0);
        expect(compareLexicographically("abc", "abc")).toBe(0);
        expect(compareLexicographically("b", "a")).toBeGreaterThan(0);
    });
});
