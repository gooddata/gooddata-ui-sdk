// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { extractReferences, getPlaceholderRegex } from "../reference-placeholder.js";

describe("extractReferences", () => {
    it("replaces a reference token with a placeholder and records the original token", () => {
        const { text, tokens } = extractReferences("Total: {metric/total}");

        expect(tokens).toEqual(["{metric/total}"]);
        expect(text).not.toContain("{metric/total}");
        expect(getPlaceholderRegex().test(text)).toBe(true);
    });

    it("leaves text without references unchanged", () => {
        const { text, tokens } = extractReferences("No references here.");

        expect(text).toBe("No references here.");
        expect(tokens).toEqual([]);
    });

    it("extracts an id containing an underscore-word-underscore pattern without leaving it in the output text", () => {
        const original = "{metric/spend_amount_-_txn_-_cutcgco}";
        const { text, tokens } = extractReferences(`Pick one: ${original}`);

        expect(tokens).toEqual([original]);
        expect(text).not.toMatch(/_txn_/);
    });

    it("extracts multiple references with distinct, order-preserving indices", () => {
        const { tokens } = extractReferences("{metric/a} and {attribute/b}");

        expect(tokens).toEqual(["{metric/a}", "{attribute/b}"]);
    });
});
