// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { findAnchorLineIdx, fullAnchor, insertBeforeAnchor } from "../anchors.js";

describe("fullAnchor", () => {
    it("returns the bare keyword when no suffix is given", () => {
        expect(fullAnchor()).toBe("PLUGGABLE_APP_SCAFFOLD_ANCHOR");
    });

    it("appends the parenthesised suffix", () => {
        expect(fullAnchor("(stages)")).toBe("PLUGGABLE_APP_SCAFFOLD_ANCHOR (stages)");
    });
});

describe("findAnchorLineIdx", () => {
    it("returns the 0-based line index of the anchor", () => {
        const lines = ["{", "  // some comment", "  // PLUGGABLE_APP_SCAFFOLD_ANCHOR", "}"];
        expect(findAnchorLineIdx(lines, "test.json")).toBe(2);
    });

    it("disambiguates by suffix when multiple anchors are present", () => {
        const lines = [
            "// PLUGGABLE_APP_SCAFFOLD_ANCHOR (stages)",
            "// PLUGGABLE_APP_SCAFFOLD_ANCHOR (remotes)",
        ];
        expect(findAnchorLineIdx(lines, "Dockerfile", "(stages)")).toBe(0);
        expect(findAnchorLineIdx(lines, "Dockerfile", "(remotes)")).toBe(1);
    });

    it("throws when the anchor is missing", () => {
        expect(() => findAnchorLineIdx(["foo", "bar"], "test.json")).toThrow(
            /Could not find "PLUGGABLE_APP_SCAFFOLD_ANCHOR" in test\.json/,
        );
    });

    it("throws when the same anchor appears more than once", () => {
        const lines = ["// PLUGGABLE_APP_SCAFFOLD_ANCHOR", "// PLUGGABLE_APP_SCAFFOLD_ANCHOR"];
        expect(() => findAnchorLineIdx(lines, "test.json")).toThrow(/Found 2 lines matching/);
    });
});

describe("insertBeforeAnchor", () => {
    it("inserts the lines immediately before the anchor line", () => {
        const content = "line A\n// PLUGGABLE_APP_SCAFFOLD_ANCHOR\nline B";
        const result = insertBeforeAnchor(content, "test.json", ["INSERTED 1", "INSERTED 2"]);
        expect(result).toBe("line A\nINSERTED 1\nINSERTED 2\n// PLUGGABLE_APP_SCAFFOLD_ANCHOR\nline B");
    });

    it("preserves trailing newline behaviour from split/join roundtrip", () => {
        const content = "// PLUGGABLE_APP_SCAFFOLD_ANCHOR\n";
        const result = insertBeforeAnchor(content, "test.json", ["X"]);
        expect(result).toBe("X\n// PLUGGABLE_APP_SCAFFOLD_ANCHOR\n");
    });
});
