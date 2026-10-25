// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { findInsertionIndexForReplacedItem } from "./bucket_layout.js";

describe("findInsertionIndexForReplacedItem", () => {
    it.each([
        // [replaced, before, after, expected]
        ["m1", ["m1"], [], 0],
        ["m1", ["m1", "m2"], ["m2"], 0],
        ["m2", ["m1", "m2"], ["m1"], 1],
        ["m1", ["m1", "m2", "m3"], ["m2", "m3"], 0],
        ["m2", ["m1", "m2", "m3"], ["m1", "m3"], 1],
        ["m3", ["m1", "m2", "m3"], ["m1", "m2"], 2],
        ["m5", ["m1", "m2", "m3", "m4", "m5"], ["m1", "m3", "m4"], 3],
        ["m5", ["m1", "m2", "m3", "m4", "m5"], ["m1", "m4"], 2],
        ["m2", ["m1", "m2", "m3"], [], 0],
    ])(
        "puts the replacement for '%s' right after the nearest surviving predecessor (before %s, after %s -> %s)",
        (replaced: string, before: string[], after: string[], expected: number) => {
            expect(findInsertionIndexForReplacedItem(replaced, before, after)).toBe(expected);
        },
    );

    it("walks backwards past predecessors that were removed too", () => {
        // m4 is replaced; m3 and m2 went with it (dependants), so m1 is the nearest survivor
        expect(findInsertionIndexForReplacedItem("m4", ["m1", "m2", "m3", "m4", "m5"], ["m1", "m5"])).toBe(1);
    });

    it("falls back to the front of the bucket when no predecessor survived", () => {
        expect(findInsertionIndexForReplacedItem("m3", ["m1", "m2", "m3"], ["m4", "m5"])).toBe(0);
    });

    it("falls back to the front when the replaced item is not in the bucket at all", () => {
        // indexOf answers -1, so slice(0, -1) drops the LAST item and the rest are searched
        expect(findInsertionIndexForReplacedItem("gone", ["m1", "m2"], ["m1", "m2"])).toBe(1);
    });

    it("uses the FIRST surviving predecessor found walking backwards, not the earliest one", () => {
        // walking back from m4: m3 survives at index 2, so the answer is 3 - m1 (index 0) is not consulted
        expect(findInsertionIndexForReplacedItem("m4", ["m1", "m2", "m3", "m4"], ["m1", "m2", "m3"])).toBe(3);
    });

    it("does not mutate the lists it was given", () => {
        const before = ["m1", "m2", "m3"];
        const after = ["m1", "m3"];

        findInsertionIndexForReplacedItem("m2", before, after);

        expect(before).toEqual(["m1", "m2", "m3"]);
        expect(after).toEqual(["m1", "m3"]);
    });
});
