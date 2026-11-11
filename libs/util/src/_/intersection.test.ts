// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _intersection } from "./intersection.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `intersection`.
describe("intersection", () => {
    describe("intersecting", () => {
        it("keeps the unique values of the first array that every other array contains, in first-array order", () => {
            expect(_intersection([2, 1], [2, 3])).toEqual([2]);
            expect(_intersection([1, 2, 3, 4], [2, 3, 5], [3, 2, 9])).toEqual([2, 3]);
            expect(_intersection([3, 1, 2], [2, 3])).toEqual([3, 2]);
            expect(_intersection([1, 2], [3, 4])).toEqual([]);
        });

        it("drops duplicates, so the result is at most as long as the shortest array", () => {
            expect(_intersection([1, 1, 2, 2], [1, 2, 2])).toEqual([1, 2]);
            expect(_intersection([1, 2], [2, 2, 1, 1])).toEqual([1, 2]);
            expect(_intersection([1, 1, 1, 2], [1])).toEqual([1]);
            expect(_intersection([2, 1, 2])).toEqual([2, 1]);
        });

        it("returns an empty array for no arrays or any empty array", () => {
            expect(_intersection()).toEqual([]);
            expect(_intersection([], [])).toEqual([]);
            expect(_intersection([], [1, 2])).toEqual([]);
            expect(_intersection([1, 2], [])).toEqual([]);
        });

        it("returns a new array holding the first array's elements by reference", () => {
            const item = { a: 1 };
            const first = [item, { a: 1 }];
            const result = _intersection(first, [item]);

            expect(result).toEqual([item]);
            expect(result[0]).toBe(item);
            expect(result).not.toBe(first);
            expect(first).toHaveLength(2);
        });
    });

    describe("equality", () => {
        it("uses SameValueZero, so NaN matches NaN and 0 matches -0, with -0 normalised to 0", () => {
            expect(_intersection([NaN, 1], [NaN, 2])).toEqual([NaN]);
            expect(_intersection([0, -0, 1], [0])).toEqual([0]);
            expect(_intersection([-0, 1], [0, 1])).toEqual([0, 1]);
            expect(Object.is(_intersection([-0], [-0])[0], 0)).toBe(true);
        });

        it("keeps distinct primitives of different types apart", () => {
            expect(_intersection([1, "1", true, null, undefined], ["1", true, null, undefined, 1])).toEqual([
                1,
                "1",
                true,
                null,
                undefined,
            ]);
            expect(_intersection([1n, 2n], [2n, 3n])).toEqual([2n]);
        });

        it("compares objects, nested arrays and symbols by reference", () => {
            const inner = [1];
            const sym = Symbol("s");

            expect(_intersection([{ a: 1 }], [{ a: 1 }])).toEqual([]);
            expect(_intersection([inner, [2]], [inner, [2]])).toEqual([inner]);
            expect(_intersection([1, [1], 2], [[1]])).toEqual([]);
            expect(_intersection([sym, Symbol("s")], [sym])).toEqual([sym]);
        });
    });

    describe("arguments", () => {
        it("returns an empty array when the first argument is not an array-like object", () => {
            expect(_intersection(null, [1])).toEqual([]);
            expect(_intersection(undefined, [1])).toEqual([]);
            expect(_intersection("ab" as unknown as string[], ["a"])).toEqual([]);
            expect(_intersection(5 as unknown as number[], [5])).toEqual([]);
        });

        it("treats any other argument that is not an array-like object as an empty array", () => {
            expect(_intersection([1, 2], null)).toEqual([]);
            expect(_intersection([1, 2], "12" as unknown as number[])).toEqual([]);
            expect(_intersection([1, 2], 5 as unknown as number[], [1, 2])).toEqual([]);
        });

        it("accepts arguments objects, typed arrays and array-like objects", () => {
            expect(_intersection(getArguments(1, 2, 3) as unknown as number[], [2, 3])).toEqual([2, 3]);
            expect(_intersection([1, 2, 3], getArguments(1, 2, 3) as unknown as number[])).toEqual([1, 2, 3]);
            expect(_intersection(new Uint8Array([1, 2, 3]), [2, 3])).toEqual([2, 3]);
            expect(_intersection({ length: 2, 0: "a", 1: "b" }, { length: 1, 0: "b" })).toEqual(["b"]);
        });

        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_intersection([1, , 2], [, 2])).toEqual([undefined, 2]);
        });

        it("handles many arrays and large arrays, where lodash switches to a Set", () => {
            expect(_intersection(...Array.from({ length: 20 }, (_, i) => [1, 2, 3, i + 4]))).toEqual([
                1, 2, 3,
            ]);
            expect(
                _intersection(
                    Array.from({ length: 300 }, (_, i) => i),
                    Array.from({ length: 300 }, (_, i) => i * 2),
                ),
            ).toHaveLength(150);
            expect(
                _intersection(
                    Array.from({ length: 120 }, (_, i) => i),
                    Array.from({ length: 120 }, (_, i) => i + 60),
                ),
            ).toHaveLength(60);
            // 0 from the first array matches the 0 of the second one, and the trailing -0 is then a duplicate of it
            expect(
                _intersection(
                    [...Array.from({ length: 150 }, (_, i) => i), NaN, -0],
                    [...Array.from({ length: 150 }, (_, i) => i + 100), NaN, 0],
                ),
            ).toEqual([0, ...Array.from({ length: 50 }, (_, i) => i + 100), NaN]);
            expect(
                _intersection(
                    Array.from({ length: 500 }, (_, i) => i % 10),
                    [3, 7, 7],
                ),
            ).toEqual([3, 7]);
        });
    });

    describe("typing", () => {
        it("returns the element type", () => {
            const numbers: number[] = _intersection([1, 2], [2]);
            const mixed: (string | number)[] = _intersection<string | number>(["a", 1], [1]);

            expect(numbers).toEqual([2]);
            expect(mixed).toEqual([1]);
        });
    });
});
