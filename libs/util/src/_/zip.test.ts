// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _zip } from "./zip.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `zip`.
describe("zip", () => {
    describe("grouping", () => {
        it("groups the elements of the arrays by position", () => {
            expect(_zip(["a", "b"], [1, 2], [true, false])).toEqual([
                ["a", 1, true],
                ["b", 2, false],
            ]);
            expect(_zip([1, 2], ["a", "b"])).toEqual([
                [1, "a"],
                [2, "b"],
            ]);
            expect(_zip([1, 2, 3])).toEqual([[1], [2], [3]]);
        });

        it("pads shorter arrays with explicit undefined entries up to the longest", () => {
            const result = _zip([1, 2, 3], ["a"], [true, false]);

            expect(result).toEqual([
                [1, "a", true],
                [2, undefined, false],
                [3, undefined, undefined],
            ]);
            expect(result.map((group) => Object.keys(group).length)).toEqual([3, 3, 3]);
            expect(_zip([], [1, 2])).toEqual([
                [undefined, 1],
                [undefined, 2],
            ]);
        });

        it("returns an empty array for no arrays, empty arrays and nullish arrays", () => {
            expect(_zip()).toEqual([]);
            expect(_zip([], [])).toEqual([]);
            expect(_zip(null, undefined)).toEqual([]);
        });

        it("returns new arrays holding the elements by reference", () => {
            const item = { a: 1 };
            const first = [item];
            const result = _zip(first, [item]);

            expect(result).toEqual([[item, item]]);
            expect(result[0]?.[0]).toBe(item);
            expect(result[0]).not.toBe(first);
            expect(first).toEqual([item]);
        });
    });

    describe("arguments", () => {
        it("skips nullish arguments and anything that is not an array-like object", () => {
            expect(_zip<number | string>([1, 2], null, undefined, ["a", "b"])).toEqual([
                [1, "a"],
                [2, "b"],
            ]);
            expect(
                _zip(
                    [1, 2],
                    "ab" as unknown as number[],
                    5 as unknown as number[],
                    { 0: "x" } as unknown as number[],
                    [3, 4],
                ),
            ).toEqual([
                [1, 3],
                [2, 4],
            ]);
            expect(
                _zip(new Set([1]) as unknown as number[], new Map([[1, 2]]) as unknown as number[], [1]),
            ).toEqual([[1]]);
            expect(_zip("ab" as unknown as number[], [1, 2])).toEqual([[1], [2]]);
        });

        it("accepts arguments objects, typed arrays and array-like objects", () => {
            expect(_zip(getArguments(1, 2) as unknown as number[], [3, 4])).toEqual([
                [1, 3],
                [2, 4],
            ]);
            expect(_zip(new Uint8Array([1, 2]), ["a", "b"])).toEqual([
                [1, "a"],
                [2, "b"],
            ]);
            expect(_zip({ length: 2, 0: "x", 1: "y" }, [1, 2])).toEqual([
                ["x", 1],
                ["y", 2],
            ]);
        });

        it("visits holes as undefined and keeps explicit undefined elements", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_zip([1, , 3], [, 2])).toEqual([
                [1, undefined],
                [undefined, 2],
                [3, undefined],
            ]);
            expect(_zip([undefined, 1], [2, undefined])).toEqual([
                [undefined, 2],
                [1, undefined],
            ]);
        });

        it("handles many and large arrays", () => {
            const many = _zip(...Array.from({ length: 30 }, (_, i) => [i, i * 2]));
            const large = _zip(
                Array.from({ length: 500 }, (_, i) => i),
                Array.from({ length: 500 }, (_, i) => -i),
            );

            expect(many).toHaveLength(2);
            expect(many[0]).toEqual(Array.from({ length: 30 }, (_, i) => i));
            expect(large).toHaveLength(500);
            expect(large[499]).toEqual([499, -499]);
        });
    });

    describe("typing", () => {
        it("types the groups as tuples of the element types, each possibly undefined", () => {
            const pairs: [string | undefined, number | undefined][] = _zip(["a"], [1]);
            const triples: [string | undefined, number | undefined, boolean | undefined][] = _zip(
                ["a"],
                [1],
                [true],
            );
            const uniform: (number | undefined)[][] = _zip<number>([1], [2], [3], [4], [5], [6]);

            expect(pairs).toEqual([["a", 1]]);
            expect(triples).toEqual([["a", 1, true]]);
            expect(uniform).toEqual([[1, 2, 3, 4, 5, 6]]);
        });
    });
});
