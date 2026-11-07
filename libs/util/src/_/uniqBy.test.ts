// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _uniqBy } from "./uniqBy.js";

const a1 = { x: 1, y: "a" };
const a2 = { x: 2, y: "b" };
const a3 = { x: 1, y: "c" };
const nested1 = { a: { b: 1 } };
const nested2 = { a: { b: 1 } };
const nested3 = { a: { b: 2 } };

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `uniqBy`.
describe("uniqBy", () => {
    describe("iteratee forms", () => {
        it("uses identity when the iteratee is null or undefined", () => {
            expect(_uniqBy([1, 2, 1, 3, 2], null as unknown as string)).toEqual([1, 2, 3]);
            expect(_uniqBy([1, 2, 1, 3, 2], undefined as unknown as string)).toEqual([1, 2, 3]);
        });

        it("accepts a function and keeps the first value per computed key", () => {
            expect(_uniqBy([2.1, 1.2, 2.3, 1.9], Math.floor)).toEqual([2.1, 1.2]);
            expect(_uniqBy(["a", "B", "A", "b"], (s) => s.toLowerCase())).toEqual(["a", "B"]);
        });

        it("invokes the iteratee with the value only", () => {
            const calls: unknown[][] = [];

            _uniqBy([1, 2], (...args: unknown[]) => calls.push(args));

            expect(calls).toEqual([[1], [2]]);
        });

        it("accepts a property name", () => {
            expect(_uniqBy([a1, a2, a3], "x")).toEqual([a1, a2]);
            expect(
                _uniqBy(
                    [
                        [1, 2],
                        [1, 3],
                        [2, 2],
                    ],
                    0,
                ),
            ).toEqual([
                [1, 2],
                [2, 2],
            ]);
            expect(
                _uniqBy(
                    [{ [Symbol.for("k")]: 1 }, { [Symbol.for("k")]: 1 }, { [Symbol.for("k")]: 2 }],
                    Symbol.for("k"),
                ),
            ).toHaveLength(2);
        });

        it("treats a missing property as one shared undefined key", () => {
            expect(_uniqBy([a1, { y: 1 }, { y: 2 }, a2], "z")).toEqual([a1]);
        });

        it("accepts a deep path as a string", () => {
            expect(_uniqBy([nested1, nested2, nested3], "a.b")).toEqual([nested1, nested3]);
        });

        it("reads an array iteratee as a [path, value] pair, never as a path", () => {
            // `a` resolves to an object, which never equals the string "b", so every element computes to false
            expect(_uniqBy([nested1, nested2, nested3], ["a", "b"])).toEqual([nested1]);
        });

        it("accepts a [path, value] pair, which groups by whether the value matches", () => {
            expect(_uniqBy([a1, a2, a3], ["x", 1])).toEqual([a1, a2]);
            expect(_uniqBy([nested1, nested2, nested3, { a: { b: 1 }, c: 1 }], ["a.b", 1])).toEqual([
                nested1,
                nested3,
            ]);
            expect(_uniqBy([nested1, nested2, nested3], ["a", { b: 1 }])).toEqual([nested1, nested3]);
        });

        it("accepts a partial object, which groups by whether the object matches it", () => {
            expect(_uniqBy([a1, a2, a3, { x: 1, y: "a", z: 0 }], { x: 1, y: "a" })).toEqual([a1, a2]);
            expect(_uniqBy([a1, a2, a3], { x: 1 })).toEqual([a1, a2]);
            expect(_uniqBy([nested1, nested2, nested3], { a: { b: 1 } })).toEqual([nested1, nested3]);
            expect(_uniqBy([a1, a2], {})).toEqual([a1]);
        });
    });

    describe("equality of computed keys", () => {
        it("compares keys by SameValueZero, so NaN equals NaN and 0 equals -0", () => {
            expect(_uniqBy([NaN, 1, NaN], (v) => v)).toEqual([NaN, 1]);
            expect(_uniqBy([0, -0, 0, 1], (v) => v)).toEqual([0, 1]);
        });

        it("compares object keys by reference", () => {
            expect(_uniqBy([a1, a2, a1, a3], (v) => v)).toEqual([a1, a2, a3]);
            expect(_uniqBy([a1, a2, a3], (v) => ({ k: v.x }))).toEqual([a1, a2, a3]);
        });

        it("collapses everything when the iteratee returns a constant, NaN included", () => {
            expect(_uniqBy([1, 2, 3], () => undefined)).toEqual([1]);
            expect(_uniqBy([1, 2, 3], () => NaN)).toEqual([1]);
        });

        it("keeps distinct primitives of different types apart", () => {
            expect(_uniqBy([1, "1", true, null, undefined, null, 1], (v) => v)).toEqual([
                1,
                "1",
                true,
                null,
                undefined,
            ]);
        });
    });

    describe("result", () => {
        it("returns a new array holding the original elements by reference", () => {
            const input = [a1, a2, a1];
            const result = _uniqBy(input, "x");

            expect(result).not.toBe(input);
            expect(result[0]).toBe(a1);
            expect(input).toEqual([a1, a2, a1]);
        });

        it("keeps the order of first occurrence", () => {
            expect(_uniqBy(["c", "a", "c", "b", "a"], (v) => v)).toEqual(["c", "a", "b"]);
        });

        it("normalises -0 to +0 in the result, as lodash does", () => {
            expect(Object.is(_uniqBy([-0, 1], (v) => v)[0], 0)).toBe(true);
        });

        it("returns an empty array for null, undefined and empty input", () => {
            expect(_uniqBy(null, "x")).toEqual([]);
            expect(_uniqBy(undefined, "x")).toEqual([]);
            expect(_uniqBy([], "x")).toEqual([]);
        });
    });

    describe("inputs", () => {
        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_uniqBy([1, , 1, , 2], (v) => v)).toEqual([1, undefined, 2]);
        });

        it("accepts array-likes, strings and arguments objects", () => {
            expect(_uniqBy({ length: 3, 0: "a", 1: "a", 2: "b" }, (v) => v)).toEqual(["a", "b"]);
            expect(_uniqBy("abca", (v) => v)).toEqual(["a", "b", "c"]);
            expect(_uniqBy(getArguments(1, 1, 2), (v) => v)).toEqual([1, 2]);
        });

        it("handles arrays of 200 elements and more, where lodash switches to a cache", () => {
            const numbers = Array.from({ length: 450 }, (_, i) => i % 7);
            const objects = Array.from({ length: 450 }, (_, i) => ({ x: i % 9 }));
            const withNaN = Array.from({ length: 300 }, (_, i) => (i % 3 ? i % 5 : NaN));
            const zeros = Array.from({ length: 300 }, (_, i) => (i % 2 ? 0 : -0));

            expect(_uniqBy(numbers, (v) => v)).toEqual([0, 1, 2, 3, 4, 5, 6]);
            expect(_uniqBy(numbers, null as unknown as string)).toEqual([0, 1, 2, 3, 4, 5, 6]);
            expect(_uniqBy(objects, "x").map((o) => o.x)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
            expect(_uniqBy(withNaN, (v) => v)).toEqual([NaN, 1, 2, 4, 0, 3]);
            expect(_uniqBy(withNaN, null as unknown as string)).toEqual([NaN, 1, 2, 4, 0, 3]);
            expect(_uniqBy(zeros, (v) => v)).toEqual([0]);
            expect(Object.is(_uniqBy(zeros, null as unknown as string)[0], 0)).toBe(true);
        });
    });

    describe("typing", () => {
        it("returns the element type for every iteratee form", () => {
            const byKey: { x: number; y: string }[] = _uniqBy([a1, a2], "x");
            const byFn: { x: number; y: string }[] = _uniqBy([a1, a2], (o) => o.y);
            const byPartial: { x: number; y: string }[] = _uniqBy([a1, a2], { x: 1 });

            expect(byKey).toHaveLength(2);
            expect(byFn).toHaveLength(2);
            expect(byPartial).toHaveLength(2);
        });
    });
});
