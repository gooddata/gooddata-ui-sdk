// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _differenceBy } from "./differenceBy.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `differenceBy`.
describe("differenceBy", () => {
    describe("iteratee", () => {
        it("compares the iteratee results and keeps the first array's values, in order", () => {
            expect(_differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor)).toEqual([1.2]);
            expect(_differenceBy([1.1, 2.2, 3.3, 4.4], [1.5], [3.9], Math.floor)).toEqual([2.2, 4.4]);
            expect(_differenceBy([1.1, 1.2, 2.1, 1.3], [2.5], Math.floor)).toEqual([1.1, 1.2, 1.3]);
            expect(_differenceBy(["a", "B"], ["A"], (s) => s.toLowerCase())).toEqual(["B"]);
        });

        it("invokes the iteratee with one argument for both sides", () => {
            expect(_differenceBy([1, 2], [2], (...args: unknown[]) => args.length)).toEqual([]);
        });

        it("accepts the property, deep path and matches shorthands", () => {
            expect(_differenceBy([{ x: 2 }, { x: 1 }], [{ x: 1 }], "x")).toEqual([{ x: 2 }]);
            expect(_differenceBy([{ a: { b: 1 } }, { a: { b: 2 } }], [{ a: { b: 2 } }], "a.b")).toEqual([
                { a: { b: 1 } },
            ]);
            expect(_differenceBy([{ x: 1 }, { x: 2 }, { x: 1, y: 1 }], [{ x: 1, y: 1 }], { x: 1 })).toEqual([
                { x: 2 },
            ]);
            expect(
                _differenceBy(
                    [
                        [1, 2],
                        [3, 4],
                    ],
                    [[3, 9]],
                    0,
                ),
            ).toEqual([[1, 2]]);
        });

        it("reads a trailing array-like argument as values, so a matchesProperty tuple is not an iteratee", () => {
            expect(_differenceBy([1, 2, 3], [2], [3])).toEqual([1]);
            expect(
                _differenceBy([{ x: 1 }, { x: 2 }], [{ x: 1, y: 1 }], ["x", 1] as unknown as string),
            ).toEqual([{ x: 1 }, { x: 2 }]);
        });

        it("falls back to identity when the iteratee is missing, undefined or null", () => {
            expect(_differenceBy([2.1, 1.2], [2.3, 1.2])).toEqual([2.1]);
            expect(_differenceBy([2.1, 1.2], [2.3, 1.2], undefined as unknown as string)).toEqual([2.1]);
            expect(_differenceBy([2.1, 1.2], [2.3, 1.2], null as unknown as string)).toEqual([2.1]);
            expect(_differenceBy([2.1, 1.2], Math.floor as unknown as number[])).toEqual([2.1, 1.2]);
        });

        it("compares criteria with SameValueZero, objects by reference", () => {
            expect(_differenceBy([NaN, 1, 2], [NaN], (n) => n)).toEqual([1, 2]);
            expect(_differenceBy(["x", 1], ["y"], (v) => (typeof v === "string" ? NaN : v))).toEqual([1]);
            expect(_differenceBy([0, -0, 1], [0], (n) => n)).toEqual([1]);
            expect(_differenceBy([1, 2], [1], (n) => ({ n }))).toEqual([1, 2]);
        });

        it("normalises -0 to 0 in the result", () => {
            expect(Object.is(_differenceBy([-0, 1], [2], (n) => n)[0], 0)).toBe(true);
            expect(_differenceBy([-0.5, 1], [2], Math.floor)).toEqual([-0.5, 1]);
        });
    });

    describe("arguments", () => {
        it("returns an empty array when the first argument is not an array-like object", () => {
            expect(_differenceBy(null, [1], Math.floor)).toEqual([]);
            expect(_differenceBy(undefined, [1], Math.floor)).toEqual([]);
            expect(_differenceBy("abc" as unknown as string[], ["a"], (c) => c)).toEqual([]);
            expect(_differenceBy([], [1], Math.floor)).toEqual([]);
        });

        it("accepts arguments objects, typed arrays and array-likes, and skips other value arguments", () => {
            expect(_differenceBy(getArguments(1.5, 2.5) as unknown as number[], [2.1], Math.floor)).toEqual([
                1.5,
            ]);
            expect(
                _differenceBy([1.1, 2.2, 3.3], getArguments(1.5, 2.5) as unknown as number[], Math.floor),
            ).toEqual([3.3]);
            expect(_differenceBy(new Uint8Array([1, 2, 3]), [2], (n) => n)).toEqual([1, 3]);
            expect(_differenceBy([1, 2, 3], { length: 1, 0: 2 }, (n) => n)).toEqual([1, 3]);
            expect(
                _differenceBy(
                    [1, 2, 3],
                    2 as unknown as number[],
                    "3" as unknown as number[],
                    null as unknown as number[],
                    { 0: 1 } as unknown as number[],
                    [3],
                    (n: number) => n,
                ),
            ).toEqual([1, 2]);
        });

        it("does not flatten nested value arrays and visits holes as undefined", () => {
            expect(_differenceBy([1, [1], 2], [[1]], (v) => v)).toEqual([1, [1], 2]);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_differenceBy([1, , 2], [2], (v) => v)).toEqual([1, undefined]);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_differenceBy([1, undefined, 2], [, 2], (v) => v)).toEqual([1]);
        });

        it("returns a new array holding the elements by reference", () => {
            const first = { x: 1 };
            const array = [first, { x: 2 }];
            const result = _differenceBy(array, [{ x: 2 }], "x");

            expect(result).toEqual([first]);
            expect(result[0]).toBe(first);
            expect(result).not.toBe(array);
            expect(array).toHaveLength(2);
        });

        it("handles large value lists, where lodash switches to a Set", () => {
            expect(
                _differenceBy(
                    Array.from({ length: 50 }, (_, i) => i + 0.5),
                    Array.from({ length: 300 }, (_, i) => i * 2 + 0.1),
                    Math.floor,
                ),
            ).toHaveLength(25);
            expect(
                _differenceBy(
                    [NaN, 0, -0, 1, 2.5],
                    Array.from({ length: 250 }, (_, i) => (i % 2 ? NaN : -0)),
                    (n) => n,
                ),
            ).toEqual([1, 2.5]);
            expect(
                _differenceBy(
                    [{ x: 1 }, { x: 2 }, { x: 3 }],
                    Array.from({ length: 250 }, (_, i) => ({ x: i % 2 })),
                    "x",
                ),
            ).toEqual([{ x: 2 }, { x: 3 }]);
            expect(
                _differenceBy(
                    [1, 199, 200, 201],
                    Array.from({ length: 200 }, (_, i) => i + 1),
                    (n) => n,
                ),
            ).toEqual([201]);
        });
    });

    describe("typing", () => {
        it("returns the element type of the first array", () => {
            const numbers: number[] = _differenceBy([2.1, 1.2], [2.3], Math.floor);
            const objects: { x: number }[] = _differenceBy([{ x: 1 }], [{ x: 1 }], "x");

            expect(numbers).toEqual([1.2]);
            expect(objects).toEqual([]);
        });
    });
});
