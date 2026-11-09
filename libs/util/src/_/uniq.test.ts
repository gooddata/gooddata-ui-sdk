// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _uniq } from "./uniq.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `uniq`.
describe("uniq", () => {
    describe("equality", () => {
        it("keeps the first occurrence of each element in order", () => {
            expect(_uniq([2, 1, 2])).toEqual([2, 1]);
            expect(_uniq(["c", "a", "c", "b", "a"])).toEqual(["c", "a", "b"]);
        });

        it("uses SameValueZero, so NaN equals NaN and 0 equals -0", () => {
            expect(_uniq([NaN, 1, NaN])).toEqual([NaN, 1]);
            expect(_uniq([0, -0, 0, 1])).toEqual([0, 1]);
        });

        it("keeps distinct primitives of different types apart", () => {
            expect(_uniq([1, "1", true, "true", null, "null", undefined, null, 1])).toEqual([
                1,
                "1",
                true,
                "true",
                null,
                "null",
                undefined,
            ]);
            expect(_uniq([10n, 10n, 11n])).toEqual([10n, 11n]);
        });

        it("compares objects and symbols by reference", () => {
            const first = { a: 1 };
            const second = { a: 1 };
            const sym = Symbol("s");

            expect(_uniq([first, second, first])).toEqual([first, second]);
            expect(_uniq([sym, sym, Symbol("s")])).toHaveLength(2);
        });

        it("is case sensitive", () => {
            expect(_uniq(["a", "A", "a"])).toEqual(["a", "A"]);
        });
    });

    describe("result", () => {
        it("returns a new array holding the original elements by reference", () => {
            const item = { a: 1 };
            const input = [item, item];
            const result = _uniq(input);

            expect(result).not.toBe(input);
            expect(result[0]).toBe(item);
            expect(input).toEqual([item, item]);
        });

        it("normalises -0 to +0 in the result, as lodash does", () => {
            expect(Object.is(_uniq([-0, 1])[0], 0)).toBe(true);
        });

        it("returns an empty array for null, undefined and empty input", () => {
            expect(_uniq(null)).toEqual([]);
            expect(_uniq(undefined)).toEqual([]);
            expect(_uniq([])).toEqual([]);
            expect(_uniq({ length: 0 })).toEqual([]);
        });
    });

    describe("inputs", () => {
        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_uniq([1, , 1, , 2])).toEqual([1, undefined, 2]);
        });

        it("accepts array-likes, strings and arguments objects", () => {
            expect(_uniq({ length: 3, 0: "a", 1: "a", 2: "b" })).toEqual(["a", "b"]);
            expect(_uniq("abca")).toEqual(["a", "b", "c"]);
            expect(_uniq(getArguments(1, 1, 2))).toEqual([1, 2]);
        });

        it("handles arrays of 200 elements and more, where lodash switches to a Set", () => {
            const item = { a: 1 };
            const sym = Symbol("s");

            expect(_uniq(Array.from({ length: 450 }, (_, i) => i % 7))).toEqual([0, 1, 2, 3, 4, 5, 6]);
            expect(_uniq(Array.from({ length: 300 }, (_, i) => (i % 3 ? i % 5 : NaN)))).toEqual([
                NaN,
                1,
                2,
                4,
                0,
                3,
            ]);
            expect(_uniq(Array.from({ length: 300 }, (_, i) => (i % 2 ? 0 : -0)))).toEqual([0]);
            expect(_uniq(Array.from({ length: 300 }, () => item))).toEqual([item]);
            expect(_uniq(Array.from({ length: 250 }, (_, i) => (i % 2 ? sym : "sym")))).toEqual(["sym", sym]);
            expect(_uniq(Array.from({ length: 250 }, (_, i) => (i % 2 ? 1 : "1")))).toEqual(["1", 1]);
            expect(
                _uniq(Array.from({ length: 250 }, (_, i) => (i % 3 ? "__proto__" : "constructor"))),
            ).toEqual(["constructor", "__proto__"]);
        });
    });

    describe("typing", () => {
        it("returns the element type", () => {
            const result: number[] = _uniq([1, 2, 1]);
            const mixed: (string | number)[] = _uniq(["a", 1, "a"]);

            expect(result).toEqual([1, 2]);
            expect(mixed).toEqual(["a", 1]);
        });
    });
});
