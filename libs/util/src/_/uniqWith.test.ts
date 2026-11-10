// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _isEqual } from "./isEqual.js";
import { _uniqWith } from "./uniqWith.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `uniqWith`.
describe("uniqWith", () => {
    describe("comparator", () => {
        it("keeps the first of the elements the comparator considers equal, in order", () => {
            const objects = [
                { x: 1, y: 2 },
                { x: 2, y: 1 },
                { x: 1, y: 2 },
            ];

            expect(_uniqWith(objects, _isEqual)).toEqual([
                { x: 1, y: 2 },
                { x: 2, y: 1 },
            ]);
            expect(_uniqWith(objects, (a, b) => a.x === b.x)).toEqual([
                { x: 1, y: 2 },
                { x: 2, y: 1 },
            ]);
            expect(
                _uniqWith(["a", "A", "b", "B", "a"], (a, b) => a.toLowerCase() === b.toLowerCase()),
            ).toEqual(["a", "b"]);
        });

        it("invokes the comparator with the current element and each kept element, earliest first", () => {
            const calls: number[][] = [];

            _uniqWith([1, 2, 1, 3], (a, b) => {
                calls.push([a, b]);

                return a === b;
            });

            expect(calls).toEqual([
                [2, 1],
                [1, 1],
                [3, 1],
                [3, 2],
            ]);
        });

        it("treats any truthy result as equal", () => {
            expect(
                _uniqWith([1, 2, 3], (a, b) =>
                    a % 2 === b % 2 ? ("same" as unknown as boolean) : (0 as unknown as boolean),
                ),
            ).toEqual([1, 2]);
            expect(_uniqWith([1, 2, 3], () => true)).toEqual([1]);
            expect(_uniqWith([1, 1, 1], () => false)).toEqual([1, 1, 1]);
        });

        it("falls back to SameValueZero when the comparator is missing or not a function", () => {
            expect(_uniqWith([2, 1, 2])).toEqual([2, 1]);
            expect(_uniqWith([2, 1, 2], undefined)).toEqual([2, 1]);
            expect(_uniqWith([2, 1, 2], null as unknown as undefined)).toEqual([2, 1]);
            expect(_uniqWith([2, 1, 2], "x" as unknown as undefined)).toEqual([2, 1]);
            expect(_uniqWith([NaN, 0, -0, NaN, 1])).toEqual([NaN, 0, 1]);
        });

        it("leaves -0 untouched when a comparator is given, unlike the fallback", () => {
            const withComparator = _uniqWith([-0, 0, 1], (a, b) => a === b);
            const withObjectIs = _uniqWith([-0, 0, 1], (a, b) => Object.is(a, b));
            const fallback = _uniqWith([-0, 0, 1]);

            expect(withComparator).toEqual([-0, 1]);
            expect(Object.is(withComparator[0], -0)).toBe(true);
            expect(withObjectIs).toEqual([-0, 0, 1]);
            expect(Object.is(fallback[0], 0)).toBe(true);
            expect(_uniqWith([NaN, NaN, 1], (a, b) => Object.is(a, b))).toEqual([NaN, 1]);
        });
    });

    describe("result", () => {
        it("returns a new array holding the kept elements by reference", () => {
            const first = { id: 1, v: "first" };
            const input = [first, { id: 1, v: "second" }];
            const result = _uniqWith(input, (a, b) => a.id === b.id);

            expect(result).not.toBe(input);
            expect(result).toHaveLength(1);
            expect(result[0]).toBe(first);
            expect(input).toHaveLength(2);
        });

        it("returns an empty array for null, undefined, primitive and empty input", () => {
            const same = (a: unknown, b: unknown): boolean => a === b;

            expect(_uniqWith(null, same)).toEqual([]);
            expect(_uniqWith(undefined, same)).toEqual([]);
            expect(_uniqWith(5 as unknown as number[], same)).toEqual([]);
            expect(_uniqWith([], same)).toEqual([]);
        });
    });

    describe("inputs", () => {
        it("accepts strings, arguments objects and array-likes", () => {
            const same = (a: unknown, b: unknown): boolean => a === b;

            expect(_uniqWith("aab", same)).toEqual(["a", "b"]);
            expect(_uniqWith(getArguments(1, 1, 2) as unknown as number[], same)).toEqual([1, 2]);
            expect(_uniqWith({ length: 3, 0: "a", 1: "a", 2: "b" }, same)).toEqual(["a", "b"]);
        });

        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_uniqWith([1, , 1, , 2], (a, b) => a === b)).toEqual([1, undefined, 2]);
        });

        it("handles symbols and large inputs", () => {
            const sym = Symbol("s");

            expect(_uniqWith([sym, sym, Symbol("s")], (a, b) => a.description === b.description)).toEqual([
                sym,
            ]);
            expect(
                _uniqWith(
                    Array.from({ length: 300 }, (_, i) => ({ k: i % 7 })),
                    (a, b) => a.k === b.k,
                ).map((item) => item.k),
            ).toEqual([0, 1, 2, 3, 4, 5, 6]);
            expect(_uniqWith(Array.from({ length: 300 }, (_, i) => i % 7))).toEqual([0, 1, 2, 3, 4, 5, 6]);
            expect(
                _uniqWith(
                    Array.from({ length: 250 }, (_, i) => ({ k: i % 5 })),
                    _isEqual,
                ),
            ).toHaveLength(5);
        });
    });

    describe("typing", () => {
        it("returns the element type and types the comparator arguments", () => {
            const result: { x: number }[] = _uniqWith([{ x: 1 }, { x: 1 }], (a, b) => a.x === b.x);

            expect(result).toEqual([{ x: 1 }]);
        });
    });
});
