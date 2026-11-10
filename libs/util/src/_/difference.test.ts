// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _difference } from "./difference.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `difference`.
describe("difference", () => {
    describe("filtering", () => {
        it("keeps the values of the first array that no other array contains, in order, duplicates included", () => {
            expect(_difference([2, 1], [2, 3])).toEqual([1]);
            expect(_difference([1, 2, 3, 4, 5], [2], [4, 5], [9])).toEqual([1, 3]);
            expect(_difference([1, 2, 1, 3, 2], [3])).toEqual([1, 2, 1, 2]);
            expect(_difference([1, 2], [3])).toEqual([1, 2]);
            expect(_difference([1, 2], [1, 2])).toEqual([]);
        });

        it("returns a copy when there is nothing to exclude", () => {
            const array = [1, 2, 1];

            expect(_difference(array)).toEqual([1, 2, 1]);
            expect(_difference(array)).not.toBe(array);
            expect(_difference(array, [])).toEqual([1, 2, 1]);
            expect(_difference([], [1])).toEqual([]);
        });

        it("returns a new array holding the elements by reference and leaves the inputs untouched", () => {
            const first = { a: 1 };
            const second = { a: 1 };
            const array = [first, second];
            const exclude = [first];
            const result = _difference(array, exclude);

            expect(result).toEqual([second]);
            expect(result[0]).toBe(second);
            expect(array).toEqual([first, second]);
            expect(exclude).toEqual([first]);
        });
    });

    describe("equality", () => {
        it("uses SameValueZero, so NaN excludes NaN and 0 excludes -0, with -0 normalised to 0", () => {
            expect(_difference([1, NaN, 2], [NaN])).toEqual([1, 2]);
            expect(_difference([NaN, 1], [1])).toEqual([NaN]);
            expect(_difference([0, -0, 1], [0])).toEqual([1]);
            expect(_difference([-0, 1], [0])).toEqual([1]);
            expect(Object.is(_difference([-0, 1], [1])[0], 0)).toBe(true);
        });

        it("keeps distinct primitives of different types apart", () => {
            expect(_difference([1, "1", true, "true", null, undefined], ["1", "true", null])).toEqual([
                1,
                true,
                undefined,
            ]);
            expect(_difference([1n, 2n, 3n], [2n])).toEqual([1n, 3n]);
        });

        it("compares objects, nested arrays and symbols by reference", () => {
            const inner = [1];
            const sym = Symbol("s");

            expect(_difference([{ a: 1 }, { a: 1 }], [{ a: 1 }])).toHaveLength(2);
            expect(_difference([inner, [2]], [inner])).toEqual([[2]]);
            expect(_difference([1, [1], 2], [[1]])).toEqual([1, [1], 2]);
            expect(_difference([sym, Symbol("s")], [sym])).toHaveLength(1);
        });
    });

    describe("arguments", () => {
        it("returns an empty array when the first argument is not an array-like object", () => {
            expect(_difference(null, [1])).toEqual([]);
            expect(_difference(undefined, [1])).toEqual([]);
            expect(_difference("abc" as unknown as string[], ["a"])).toEqual([]);
            expect(_difference(5 as unknown as number[], [5])).toEqual([]);
        });

        it("accepts arguments objects, typed arrays and array-like objects on either side", () => {
            expect(_difference(getArguments(1, 2, 3) as unknown as number[], [2])).toEqual([1, 3]);
            expect(_difference([1, 2, 3], getArguments(1, 2, 3) as unknown as number[])).toEqual([]);
            expect(_difference(new Uint8Array([1, 2, 3]), [2])).toEqual([1, 3]);
            expect(_difference([1, 2, 3], new Uint8Array([2]))).toEqual([1, 3]);
            expect(_difference({ length: 2, 0: "a", 1: "b" }, ["a"])).toEqual(["b"]);
            expect(_difference(["a", "b"], { length: 1, 0: "a" })).toEqual(["b"]);
        });

        it("skips exclusion arguments that are not array-like objects", () => {
            expect(
                _difference(
                    [1, 2, 3],
                    2 as unknown as number[],
                    "3" as unknown as number[],
                    null as unknown as number[],
                    { 0: 1 } as unknown as number[],
                    [3],
                ),
            ).toEqual([1, 2]);
            expect(
                _difference(
                    [1, 2],
                    new Set([1]) as unknown as number[],
                    new Map([[2, 2]]) as unknown as number[],
                ),
            ).toEqual([1, 2]);
        });

        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_difference([1, , 2], [2])).toEqual([1, undefined]);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_difference([1, undefined, 2], [, 2])).toEqual([1]);
        });

        it("handles large exclusion lists, where lodash switches to a Set", () => {
            const item = { a: 1 };
            const sym = Symbol("s");

            expect(
                _difference(
                    Array.from({ length: 50 }, (_, i) => i),
                    Array.from({ length: 300 }, (_, i) => i * 2),
                ),
            ).toEqual(Array.from({ length: 25 }, (_, i) => i * 2 + 1));
            expect(
                _difference(
                    [NaN, 0, -0, 1, 2],
                    Array.from({ length: 250 }, (_, i) => (i % 2 ? NaN : -0)),
                ),
            ).toEqual([1, 2]);
            expect(
                _difference<unknown>(
                    [item, { a: 1 }, 1],
                    Array.from({ length: 250 }, (_, i) => (i % 2 ? item : "x")),
                ),
            ).toHaveLength(2);
            expect(
                _difference(
                    [1, "1", true, "true"],
                    Array.from({ length: 250 }, (_, i) => (i % 2 ? 1 : "true")),
                ),
            ).toEqual(["1", true]);
            expect(
                _difference(
                    [sym, "sym", 1],
                    Array.from({ length: 250 }, (_, i) => (i % 2 ? sym : "sym")),
                ),
            ).toEqual([1]);
            expect(
                _difference(
                    [1, 199, 200, 201],
                    Array.from({ length: 200 }, (_, i) => i + 1),
                ),
            ).toEqual([201]);
        });

        it("handles a large first array", () => {
            const result = _difference(
                Array.from({ length: 500 }, (_, i) => i % 10),
                [3, 7],
            );

            expect(result).toHaveLength(400);
            expect(result.includes(3) || result.includes(7)).toBe(false);
        });
    });

    describe("typing", () => {
        it("returns the element type of the first array", () => {
            const numbers: number[] = _difference([1, 2], [2]);
            const mixed: (string | number)[] = _difference<string | number>(["a", 1], [1]);

            expect(numbers).toEqual([1]);
            expect(mixed).toEqual(["a"]);
        });
    });
});
