// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ensureTrailingCommaBeforeAnchor } from "../jsonAnchors.js";

describe("ensureTrailingCommaBeforeAnchor", () => {
    it("adds a comma to a code line that lacks one", () => {
        const input = `[
    { "a": 1 }
    // PLUGGABLE_APP_SCAFFOLD_ANCHOR
]`;
        const output = ensureTrailingCommaBeforeAnchor(input);
        expect(output).toContain('{ "a": 1 },');
    });

    it("is idempotent when the comma is already present", () => {
        const input = `[
    { "a": 1 },
    // PLUGGABLE_APP_SCAFFOLD_ANCHOR
]`;
        expect(ensureTrailingCommaBeforeAnchor(input)).toBe(input);
    });

    it("inserts the comma before an inline // comment, preserving the comment position", () => {
        const input = `[
    { "a": 1 } // last entry
    // PLUGGABLE_APP_SCAFFOLD_ANCHOR
]`;
        const output = ensureTrailingCommaBeforeAnchor(input);
        const lines = output.split("\n");
        expect(lines[1]).toBe('    { "a": 1 }, // last entry');
    });

    it("skips blank lines and pure-comment lines when looking back for the last code line", () => {
        const input = `[
    { "a": 1 }

    // a separator comment
    // PLUGGABLE_APP_SCAFFOLD_ANCHOR
]`;
        const output = ensureTrailingCommaBeforeAnchor(input);
        expect(output).toContain('{ "a": 1 },');
    });

    it("honours the disambiguating suffix", () => {
        const input = `[
    { "a": 1 }
    // PLUGGABLE_APP_SCAFFOLD_ANCHOR (alpha)
    { "b": 2 }
    // PLUGGABLE_APP_SCAFFOLD_ANCHOR (beta)
]`;
        const output = ensureTrailingCommaBeforeAnchor(input, "(beta)");
        // Only the (beta) anchor's preceding line gets the comma added.
        const lines = output.split("\n");
        expect(lines.find((l) => l.includes('"a": 1'))).toBe('    { "a": 1 }');
        expect(lines.find((l) => l.includes('"b": 2'))).toBe('    { "b": 2 },');
    });
});
