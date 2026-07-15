// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { moveItem, resolveTarget } from "../reorderListModel.js";

describe("resolveTarget", () => {
    // [description, dragged index, gap (insert position 0..n), expected splice destination (null = no-op)]
    const cases: [string, number, number, number | null][] = [
        ["moving down: gap between later rows", 0, 2, 1],
        ["moving down: trailing gap lands at the end", 0, 3, 2],
        ["moving up: leading gap lands at the start", 2, 0, 0],
        ["moving up: gap between earlier rows", 2, 1, 1],
        ["gap before itself is a no-op", 1, 1, null],
        ["gap after itself is a no-op", 1, 2, null],
        ["first row into the leading gap is a no-op", 0, 0, null],
        ["last row into the trailing gap is a no-op", 2, 3, null],
    ];

    it.each(cases)("%s", (_description, from, gap, expected) => {
        expect(resolveTarget(from, gap)).toBe(expected);
    });
});

describe("moveItem", () => {
    const items = ["a", "b", "c", "d"];

    it("moves an item down", () => {
        expect(moveItem(items, 0, 2)).toEqual(["b", "c", "a", "d"]);
    });

    it("moves an item up", () => {
        expect(moveItem(items, 3, 0)).toEqual(["d", "a", "b", "c"]);
    });

    it("does not mutate the input", () => {
        moveItem(items, 0, 3);
        expect(items).toEqual(["a", "b", "c", "d"]);
    });
});

describe("resolveTarget + moveItem", () => {
    it("composes into the expected final order", () => {
        const items = ["a", "b", "c"];
        // Drag "c" (index 2) into the leading gap.
        const to = resolveTarget(2, 0);
        expect(to).toBe(0);
        expect(moveItem(items, 2, to ?? 2)).toEqual(["c", "a", "b"]);
    });
});
