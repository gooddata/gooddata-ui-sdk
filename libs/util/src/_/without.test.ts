// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _without } from "./without.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `without`.
describe("without", () => {
    describe("filtering", () => {
        it("excludes every given value, keeping the order and the duplicates of the rest", () => {
            expect(_without([2, 1, 2, 3], 1, 2)).toEqual([3]);
            expect(_without([1, 2, 3, 4, 5], 2, 4, 5, 9)).toEqual([1, 3]);
            expect(_without([1, 2, 1, 3, 2], 3)).toEqual([1, 2, 1, 2]);
            expect(_without([1, 2], 3)).toEqual([1, 2]);
            expect(_without([1, 2], 1, 2)).toEqual([]);
            expect(_without([1, 2], 1, 2, 1, 2)).toEqual([]);
        });

        it("returns a copy when there is nothing to exclude", () => {
            const array = [1, 2, 1];

            expect(_without(array)).toEqual([1, 2, 1]);
            expect(_without(array)).not.toBe(array);
            expect(_without([], 1)).toEqual([]);
            expect(_without([])).toEqual([]);
        });

        it("returns a new array holding the elements by reference and leaves the input untouched", () => {
            const first = { id: 1 };
            const second = { id: 2 };
            const array = [first, second, first];
            const result = _without(array, second);

            expect(result).toEqual([first, first]);
            expect(result[0]).toBe(first);
            expect(result).not.toBe(array);
            expect(array).toEqual([first, second, first]);
        });

        it("uses SameValueZero, so NaN excludes NaN and 0 excludes -0, with -0 normalised to 0", () => {
            expect(_without([1, NaN, 2, NaN], NaN)).toEqual([1, 2]);
            expect(_without([0, -0, 1], 0)).toEqual([1]);
            expect(_without([0, -0, 1], -0)).toEqual([1]);
            expect(_without([-0, 1], 1).map((value) => Object.is(value, 0))).toEqual([true]);
        });

        it("keeps distinct primitives of different types apart", () => {
            expect(_without([1, "1", true], 1)).toEqual(["1", true]);
            expect(_without(["1", 1], "1")).toEqual([1]);
            expect(_without([null, undefined, 1], null)).toEqual([undefined, 1]);
            expect(_without([null, undefined, 1], undefined)).toEqual([null, 1]);
            expect(_without(["a", "b", "c"], "b")).toEqual(["a", "c"]);
        });

        it("compares objects, nested arrays, functions and symbols by reference", () => {
            const object = { a: 1 };
            const nested = [1];
            const fn = () => 1;
            const symbol = Symbol("s");

            expect(_without([object, { a: 1 }], object)).toEqual([{ a: 1 }]);
            expect(_without([object], { a: 1 })).toEqual([object]);
            expect(_without([nested, [1]], nested)).toEqual([[1]]);
            expect(_without<unknown>([fn, symbol, null], fn, symbol)).toEqual([null]);
            expect(_without([fn], () => 1)).toEqual([fn]);
        });

        it("treats a single array value as one value to exclude, not as a list", () => {
            const list = ["a"];

            expect(_without<unknown>(["a", "b"], ["a"])).toEqual(["a", "b"]);
            expect(_without<unknown>([list, "b"], list)).toEqual(["b"]);
            expect(_without<unknown>([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]);
        });
    });

    describe("inputs", () => {
        it("returns an empty array when the first argument is not an array-like object", () => {
            expect(_without(null, 1)).toEqual([]);
            expect(_without(undefined, 1)).toEqual([]);
            expect(_without("abc" as unknown as string[], "a")).toEqual([]);
            expect(_without(1 as unknown as number[], 1)).toEqual([]);
            expect(_without({ a: 1 } as unknown as number[], 1)).toEqual([]);
            expect(_without(new Set([1]) as unknown as number[], 1)).toEqual([]);
            expect(_without(new Map() as unknown as number[], 1)).toEqual([]);
            expect(_without((() => 1) as unknown as number[], 1)).toEqual([]);
        });

        it("accepts arguments objects, typed arrays and array-like objects", () => {
            expect(_without(getArguments(1, 2, 2, 3) as unknown as number[], 2)).toEqual([1, 3]);
            expect(_without(new Uint8Array([1, 2, 3]), 2)).toEqual([1, 3]);
            expect(_without({ length: 2, 0: "a", 1: "b" }, "a")).toEqual(["b"]);
            expect(_without(Object("abc") as unknown as string[], "a")).toEqual(["b", "c"]);
            expect(_without({ length: 0 } as unknown as number[], 1)).toEqual([]);
            expect(_without({ length: -1, 0: "x" } as unknown as string[])).toEqual([]);
            expect(_without({ length: "2", 0: "a" } as unknown as string[], "a")).toEqual([]);
        });

        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            const sparse = [1, , 3];

            expect(_without(sparse, 1)).toEqual([undefined, 3]);
            expect(_without(sparse, undefined)).toEqual([1, 3]);
            expect(1 in _without(sparse, 9)).toBe(true);
        });

        it("handles many values and a large first array", () => {
            const values = Array.from({ length: 250 }, (_, index) => index);
            const array = Array.from({ length: 300 }, (_, index) => index);

            expect(_without(array, ...values)).toEqual(array.slice(250));
            expect(_without(array, ...array)).toEqual([]);
            expect(_without([1, 2, 3], ...Array.from({ length: 300 }, (_, index) => index))).toEqual([]);

            const repeated = Array.from({ length: 300 }, (_, index) => index % 7);

            expect(_without(repeated, 0, 1, 2, 3, 4, 5)).toEqual(Array.from({ length: 42 }, () => 6));
        });

        it("works through apply and with no values at all", () => {
            expect(_without.apply(null, [[1, 2, 3]])).toEqual([1, 2, 3]);
            expect(_without.apply(null, [[1, 2, 3], 2, 3])).toEqual([1]);
        });
    });

    describe("typing", () => {
        it("returns the element type of the array", () => {
            const numbers: number[] = _without([1, 2, 3], 2);
            const strings: string[] = _without(["a", "b"] as const, "a");
            const mixed: (string | number)[] = _without<string | number>([1, "a"], "a");
            const fromNullable: number[] = _without(null as number[] | null, 1);

            expect(numbers).toEqual([1, 3]);
            expect(strings).toEqual(["b"]);
            expect(mixed).toEqual([1]);
            expect(fromNullable).toEqual([]);
        });
    });
});
