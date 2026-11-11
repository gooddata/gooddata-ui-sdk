// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _initial } from "./initial.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `initial`.
describe("initial", () => {
    describe("arrays", () => {
        it("returns all but the last element", () => {
            expect(_initial([1, 2, 3])).toEqual([1, 2]);
            expect(_initial([1, 2])).toEqual([1]);
            expect(_initial(["a", "b"])).toEqual(["a"]);
            expect(_initial([[1], [2]])).toEqual([[1]]);
        });

        it("returns an empty array for a single element or an empty array", () => {
            expect(_initial([1])).toEqual([]);
            expect(_initial([])).toEqual([]);
        });

        it("keeps every kind of value by reference, in order", () => {
            const object = { x: 1 };
            const fn = () => 1;
            const symbol = Symbol("s");
            const values: unknown[] = [object, fn, symbol, null, undefined, NaN, -0, 10n, "last"];
            const result = _initial(values);

            expect(result).toEqual([object, fn, symbol, null, undefined, NaN, -0, 10n]);
            expect(result[0]).toBe(object);
            expect(result[1]).toBe(fn);
            expect(Object.is(result[6], -0)).toBe(true);
        });

        it("returns a new dense array and leaves the input untouched", () => {
            const array = [1, 2, 3];
            const result = _initial(array);

            expect(result).not.toBe(array);
            expect(array).toEqual([1, 2, 3]);
            expect(_initial(Object.assign([1, 2], { extra: true }))).toEqual([1]);
        });

        it("turns holes of a sparse array into undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            const sparse = [1, , 3, , 5];
            const result = _initial(sparse);

            expect(result).toEqual([1, undefined, 3, undefined]);
            expect(1 in result).toBe(true);
            expect(3 in result).toBe(true);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_initial([1, ,])).toEqual([1]);
        });

        it("handles a large array", () => {
            const array = Array.from({ length: 500 }, (_, index) => index);

            expect(_initial(array)).toEqual(array.slice(0, -1));
            expect(_initial(array)).toHaveLength(499);
        });
    });

    describe("other inputs", () => {
        it("returns an empty array for nullish input", () => {
            expect(_initial(null)).toEqual([]);
            expect(_initial(undefined)).toEqual([]);
            expect((_initial as unknown as () => unknown[])()).toEqual([]);
        });

        it("slices strings by character", () => {
            expect(_initial("abc" as unknown as string[])).toEqual(["a", "b"]);
            expect(_initial("a" as unknown as string[])).toEqual([]);
            expect(_initial("" as unknown as string[])).toEqual([]);
            expect(_initial("héllo" as unknown as string[])).toEqual(["h", "é", "l", "l"]);
            expect(_initial("ab😀" as unknown as string[])).toEqual(["a", "b", "\ud83d"]);
            expect(_initial(Object("abc") as unknown as string[])).toEqual(["a", "b"]);
        });

        it("accepts array-like objects, typed arrays and arguments objects, returning a plain array", () => {
            expect(_initial({ length: 3, 0: "a", 1: "b", 2: "c" })).toEqual(["a", "b"]);
            expect(_initial({ length: 1, 0: "a" })).toEqual([]);
            expect(_initial({ length: 0 } as unknown as string[])).toEqual([]);
            expect(_initial(new Uint8Array([1, 2, 3]))).toEqual([1, 2]);
            expect(Array.isArray(_initial(new Uint8Array([1, 2, 3])))).toBe(true);
            expect(_initial(new Float64Array([]))).toEqual([]);
            expect(_initial(getArguments(1, 2, 3) as unknown as number[])).toEqual([1, 2]);
            expect(Array.isArray(_initial(getArguments(1, 2)))).toBe(true);

            const lazy = {
                length: 3,
                get 1() {
                    return "lazy";
                },
            } as unknown as string[];

            expect(_initial(lazy)).toEqual([undefined, "lazy"]);
        });

        it("uses the length property the way lodash does", () => {
            expect(_initial({ length: 2.5, 0: "a", 1: "b", 2: "c" } as unknown as string[])).toEqual(["a"]);
            expect(_initial({ length: -1, 0: "a" } as unknown as string[])).toEqual([]);
            expect(_initial({ length: NaN, 0: "a" } as unknown as string[])).toEqual([]);
            expect(_initial({ length: Infinity, 0: "a" } as unknown as string[])).toEqual([]);
        });

        it("returns an empty array for values without a usable length", () => {
            expect(_initial({ 0: "a", 1: "b" } as unknown as string[])).toEqual([]);
            expect(_initial({ a: 1 } as unknown as number[])).toEqual([]);
            expect(_initial(new Set([1, 2]) as unknown as number[])).toEqual([]);
            expect(_initial(new Map([[1, 2]]) as unknown as number[])).toEqual([]);
            expect(_initial(5 as unknown as number[])).toEqual([]);
            expect(_initial(true as unknown as number[])).toEqual([]);
            expect(_initial(Object(3) as unknown as number[])).toEqual([]);
            expect(_initial(new Date(0) as unknown as number[])).toEqual([]);
            expect(_initial((() => 1) as unknown as number[])).toEqual([]);
        });

        it("ignores extra arguments", () => {
            const withExtra = _initial as unknown as (a: number[], b: number) => number[];

            expect(withExtra([1, 2, 3], 2)).toEqual([1, 2]);
        });
    });

    describe("typing", () => {
        it("keeps the element type", () => {
            const fromList: number[] = _initial([1, 2, 3]);
            const fromNullable: string[] = _initial(null as string[] | null);

            expect(fromList).toEqual([1, 2]);
            expect(fromNullable).toEqual([]);
        });
    });
});
