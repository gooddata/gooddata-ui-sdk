// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _chunk } from "./chunk.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `chunk`.
describe("chunk", () => {
    describe("splitting", () => {
        it("splits an array into groups of the given size, the last one holding the remainder", () => {
            expect(_chunk(["a", "b", "c", "d"], 2)).toEqual([
                ["a", "b"],
                ["c", "d"],
            ]);
            expect(_chunk(["a", "b", "c", "d"], 3)).toEqual([["a", "b", "c"], ["d"]]);
            expect(_chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk([1, 2, 3, 4, 5], 1)).toEqual([[1], [2], [3], [4], [5]]);
        });

        it("returns one chunk when the size is the length or larger", () => {
            expect(_chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
            expect(_chunk([1, 2, 3], 4)).toEqual([[1, 2, 3]]);
            expect(_chunk([1, 2, 3], Infinity)).toEqual([[1, 2, 3]]);
            expect(_chunk([1, 2, 3], Number.MAX_SAFE_INTEGER)).toEqual([[1, 2, 3]]);
            expect(_chunk([1], 1)).toEqual([[1]]);
        });

        it("defaults the size to 1", () => {
            expect(_chunk([1, 2, 3])).toEqual([[1], [2], [3]]);
            expect(_chunk([1, 2, 3], undefined)).toEqual([[1], [2], [3]]);
        });

        it("returns an empty array for an empty array or a size below 1", () => {
            expect(_chunk([], 2)).toEqual([]);
            expect(_chunk([1, 2, 3], 0)).toEqual([]);
            expect(_chunk([1, 2, 3], -1)).toEqual([]);
            expect(_chunk([1, 2, 3], -0)).toEqual([]);
            expect(_chunk([1, 2, 3], -Infinity)).toEqual([]);
            expect(_chunk([1, 2, 3], 0.5)).toEqual([]);
            expect(_chunk([1, 2, 3], NaN)).toEqual([]);
            expect(_chunk([1, 2, 3], null as unknown as number)).toEqual([]);
        });

        it("truncates a fractional size and coerces other size values like lodash", () => {
            expect(_chunk([1, 2, 3, 4, 5], 2.9)).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk([1, 2, 3, 4, 5], 2.1)).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk([1, 2, 3, 4, 5], "2" as unknown as number)).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk([1, 2, 3, 4, 5], " 3 " as unknown as number)).toEqual([
                [1, 2, 3],
                [4, 5],
            ]);
            expect(_chunk([1, 2, 3, 4, 5], "0x10" as unknown as number)).toEqual([[1, 2, 3, 4, 5]]);
            expect(_chunk([1, 2, 3, 4, 5], "1e1" as unknown as number)).toEqual([[1, 2, 3, 4, 5]]);
            expect(_chunk([1, 2, 3], true as unknown as number)).toEqual([[1], [2], [3]]);
            expect(_chunk([1, 2, 3], false as unknown as number)).toEqual([]);
            expect(_chunk([1, 2, 3], "x" as unknown as number)).toEqual([]);
            expect(_chunk([1, 2, 3, 4, 5], [2] as unknown as number)).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk([1, 2, 3], [1, 2] as unknown as number)).toEqual([]);
            expect(_chunk([1, 2, 3], {} as unknown as number)).toEqual([]);
            expect(_chunk([1, 2, 3, 4, 5], { valueOf: () => 2 } as unknown as number)).toEqual([
                [1, 2],
                [3, 4],
                [5],
            ]);
            expect(_chunk([1, 2, 3, 4, 5], { valueOf: () => "3" } as unknown as number)).toEqual([
                [1, 2, 3],
                [4, 5],
            ]);
            expect(() => _chunk([1, 2, 3], Symbol("2") as unknown as number)).not.toThrow();
            expect(_chunk([1, 2, 3], Symbol("2") as unknown as number)).toEqual([]);
            expect(() => _chunk([1, 2, 3], 10n as unknown as number)).toThrow(TypeError);
        });

        it("returns new arrays holding the elements by reference and leaves the input untouched", () => {
            const object = { x: 1 };
            const array = [object, object, object];
            const result = _chunk(array, 2);

            expect(result).toEqual([[object, object], [object]]);
            expect(result[1]?.[0]).toBe(object);
            expect(result).not.toBe(array);
            expect(array).toEqual([object, object, object]);
            expect(_chunk([null, undefined, NaN, -0], 3)).toEqual([[null, undefined, NaN], [-0]]);
        });

        it("turns holes of a sparse array into undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            const result = _chunk([1, , 3, , 5], 2);

            expect(result).toEqual([[1, undefined], [3, undefined], [5]]);
            expect(1 in (result[0] as unknown[])).toBe(true);
        });

        it("handles a large array", () => {
            const array = Array.from({ length: 1000 }, (_, index) => index);

            expect(_chunk(array, 7)).toHaveLength(143);
            expect(_chunk(array, 7)[142]).toEqual([994, 995, 996, 997, 998, 999]);
            expect(_chunk(array, 999)).toEqual([array.slice(0, 999), [999]]);
            expect(_chunk(array, 1000)).toEqual([array]);
            expect(_chunk(array, 1001)).toEqual([array]);
            expect(_chunk(array, 1)).toHaveLength(1000);
        });
    });

    describe("inputs", () => {
        it("returns an empty array for nullish input", () => {
            expect(_chunk(null, 2)).toEqual([]);
            expect(_chunk(undefined, 2)).toEqual([]);
            expect(_chunk(null)).toEqual([]);
        });

        it("splits strings by character", () => {
            expect(_chunk("abcde", 2)).toEqual([["a", "b"], ["c", "d"], ["e"]]);
            expect(_chunk("abcde")).toEqual([["a"], ["b"], ["c"], ["d"], ["e"]]);
            expect(_chunk("", 2)).toEqual([]);
        });

        it("accepts array-like objects, typed arrays and arguments objects, returning plain arrays", () => {
            expect(_chunk({ length: 3, 0: "a", 1: "b", 2: "c" }, 2)).toEqual([["a", "b"], ["c"]]);
            expect(_chunk({ length: 0 } as unknown as string[], 2)).toEqual([]);
            expect(_chunk(new Uint8Array([1, 2, 3]), 2)).toEqual([[1, 2], [3]]);
            expect(_chunk(new Uint8Array([1, 2, 3]), 2).map(Array.isArray)).toEqual([true, true]);
            expect(_chunk(getArguments(1, 2, 3) as unknown as number[], 2)).toEqual([[1, 2], [3]]);
        });

        it("uses the length property the way lodash does", () => {
            expect(_chunk({ length: "3", 0: "a", 1: "b", 2: "c" } as unknown as string[], 2)).toEqual([
                ["a", "b"],
                ["c"],
            ]);
            expect(_chunk({ length: 2.5, 0: "a", 1: "b", 2: "c" } as unknown as string[], 2)).toEqual([
                ["a", "b"],
                [],
            ]);
            expect(_chunk({ length: -1, 0: "a" } as unknown as string[], 2)).toEqual([]);
            expect(() => _chunk({ length: Infinity, 0: "a" } as unknown as string[], 2)).toThrow(RangeError);
        });

        it("returns an empty array for values without a usable length", () => {
            expect(_chunk({ 0: "a" } as unknown as string[], 2)).toEqual([]);
            expect(_chunk({} as unknown as string[], 1)).toEqual([]);
            expect(_chunk(5 as unknown as number[], 2)).toEqual([]);
            expect(_chunk(true as unknown as number[], 1)).toEqual([]);
            expect(_chunk(new Set([1, 2]) as unknown as number[], 1)).toEqual([]);
        });
    });

    describe("iteratee guard", () => {
        it("ignores the index and collection when used as a map callback", () => {
            expect(
                [
                    [1, 2, 3],
                    [4, 5, 6],
                ].map(_chunk),
            ).toEqual([
                [[1], [2], [3]],
                [[4], [5], [6]],
            ]);
            expect(["ab", "cd"].map(_chunk)).toEqual([
                [["a"], ["b"]],
                [["c"], ["d"]],
            ]);
            expect([[1, 2, 3]].map(_chunk)).toEqual([[[1], [2], [3]]]);
        });

        it("recognises the guard only when it holds the array at the given index", () => {
            const array = [1, 2, 3, 4, 5];

            expect(_chunk(array, 2, 0)).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk(array, 2, 1)).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk(array, 2, "x")).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk(array, 2, {})).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk(array, 2, [array])).toEqual([[1, 2], [3, 4], [5]]);
            expect(_chunk(array, 0, [array])).toEqual([[1], [2], [3], [4], [5]]);

            const pair = [1, 2];

            // a string index is a guard when the object holds the array under that key
            expect(_chunk(pair, "2" as unknown as number, { 2: pair })).toEqual([[1], [2]]);
            expect(_chunk([1, 2], "2" as unknown as number, { 2: [1, 2] })).toEqual([[1, 2]]);
            // a numeric index needs an array-like collection
            expect(_chunk(pair, 2, { 2: pair })).toEqual([[1, 2]]);
        });
    });

    describe("typing", () => {
        it("returns an array of arrays of the element type", () => {
            const numbers: number[][] = _chunk([1, 2, 3], 2);
            const strings: string[][] = _chunk(["a"] as const);
            const fromNullable: boolean[][] = _chunk(null as boolean[] | null, 2);

            expect(numbers).toEqual([[1, 2], [3]]);
            expect(strings).toEqual([["a"]]);
            expect(fromNullable).toEqual([]);
        });
    });
});
