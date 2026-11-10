// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _union } from "./union.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `union`.
describe("union", () => {
    describe("combining", () => {
        it("concatenates the arrays and keeps the first occurrence of each value, in order", () => {
            expect(_union([2], [1, 2])).toEqual([2, 1]);
            expect(_union([1, 2], [2, 3], [3, 4, 1])).toEqual([1, 2, 3, 4]);
            expect(_union([2, 1, 2])).toEqual([2, 1]);
        });

        it("returns an empty array for no arrays or only empty arrays", () => {
            expect(_union()).toEqual([]);
            expect(_union([], [])).toEqual([]);
        });

        it("returns a new array holding the elements by reference and leaves the inputs untouched", () => {
            const item = { a: 1 };
            const first = [item];
            const second = [item, { a: 1 }];
            const result = _union(first, second);

            expect(result).not.toBe(first);
            expect(result).toHaveLength(2);
            expect(result[0]).toBe(item);
            expect(result[1]).toBe(second[1]);
            expect(first).toEqual([item]);
            expect(second).toHaveLength(2);
        });
    });

    describe("equality", () => {
        it("uses SameValueZero, so NaN equals NaN and 0 equals -0, with -0 normalised to 0", () => {
            const result = _union([NaN, 0], [NaN, -0, 1]);

            expect(result).toEqual([NaN, 0, 1]);
            expect(Object.is(result[1], 0)).toBe(true);
            expect(Object.is(_union([-0], [0])[0], 0)).toBe(true);
        });

        it("keeps distinct primitives of different types apart", () => {
            expect(_union([1, "1", true], ["true", null, undefined, null, 1])).toEqual([
                1,
                "1",
                true,
                "true",
                null,
                undefined,
            ]);
            expect(_union([1n, 2n], [2n, 3n])).toEqual([1n, 2n, 3n]);
        });

        it("compares objects, nested arrays and symbols by reference", () => {
            const first = { a: 1 };
            const second = { a: 1 };
            const inner = [1];
            const sym = Symbol("s");

            expect(_union([first], [second, first])).toEqual([first, second]);
            expect(_union([inner, [2]], [[1]])).toHaveLength(3);
            expect(_union([sym], [sym, Symbol("s")])).toHaveLength(2);
        });
    });

    describe("arguments", () => {
        it("skips null, undefined and anything that is not an array-like object", () => {
            expect(_union(null, [1], undefined, [2, 1])).toEqual([1, 2]);
            expect(_union([1], 2 as unknown as number[], "ab" as unknown as number[], [3])).toEqual([1, 3]);
            expect(_union(true as unknown as number[], (() => 1) as unknown as number[], [1])).toEqual([1]);
            expect(
                _union(new Set([1]) as unknown as number[], new Map([[1, 2]]) as unknown as number[], [3]),
            ).toEqual([3]);
        });

        it("spreads arguments objects, typed arrays and array-like objects", () => {
            expect(_union(getArguments(1, 2, 2, 3) as unknown as number[], [4])).toEqual([1, 2, 3, 4]);
            expect(_union(new Uint8Array([1, 2]), [2, 3])).toEqual([1, 2, 3]);
            expect(_union({ length: 2, 0: "a", 1: "b" }, ["c", "a"])).toEqual(["a", "b", "c"]);
        });

        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_union([1, , 2], [, 3])).toEqual([1, undefined, 2, 3]);
        });

        it("handles many arrays and large arrays, where lodash switches to a Set", () => {
            const item = { a: 1 };

            expect(_union(...Array.from({ length: 50 }, (_, i) => [i % 10, (i + 1) % 10]))).toEqual([
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            ]);
            expect(
                _union(
                    Array.from({ length: 300 }, (_, i) => i % 7),
                    Array.from({ length: 300 }, (_, i) => (i % 5) + 5),
                ),
            ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            expect(
                _union(
                    Array.from({ length: 300 }, (_, i) => (i % 3 ? i % 4 : NaN)),
                    [-0, 0, NaN],
                ),
            ).toEqual([NaN, 1, 2, 0, 3]);
            expect(
                _union(
                    Array.from({ length: 250 }, () => item),
                    [item, { a: 1 }],
                ),
            ).toHaveLength(2);
            expect(_union(Array.from({ length: 250 }, (_, i) => (i % 2 ? 1 : "1")))).toEqual(["1", 1]);
        });
    });

    describe("typing", () => {
        it("returns the element type", () => {
            const numbers: number[] = _union([1], [2, 1]);
            const mixed: (string | number)[] = _union<string | number>(["a"], [1, "a"]);

            expect(numbers).toEqual([1, 2]);
            expect(mixed).toEqual(["a", 1]);
        });
    });
});
