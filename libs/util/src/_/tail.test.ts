// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _tail } from "./tail.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `tail`.
describe("tail", () => {
    describe("arrays", () => {
        it("returns all but the first element", () => {
            expect(_tail([1, 2, 3])).toEqual([2, 3]);
            expect(_tail([1, 2])).toEqual([2]);
            expect(_tail(["a", "b"])).toEqual(["b"]);
            expect(_tail([[1], [2]])).toEqual([[2]]);
        });

        it("returns an empty array for a single element or an empty array", () => {
            expect(_tail([1])).toEqual([]);
            expect(_tail([])).toEqual([]);
        });

        it("keeps every kind of value by reference, in order", () => {
            const object = { x: 1 };
            const fn = () => 1;
            const symbol = Symbol("s");
            const values: unknown[] = [0, object, fn, symbol, null, undefined, NaN, -0, 10n];
            const result = _tail(values);

            expect(result).toEqual([object, fn, symbol, null, undefined, NaN, -0, 10n]);
            expect(result[0]).toBe(object);
            expect(result[1]).toBe(fn);
            expect(Object.is(result[6], -0)).toBe(true);
        });

        it("returns a new dense array and leaves the input untouched", () => {
            const array = [1, 2, 3];
            const result = _tail(array);

            expect(result).not.toBe(array);
            expect(array).toEqual([1, 2, 3]);
            expect(_tail(Object.assign([1, 2], { extra: true }))).toEqual([2]);
        });

        it("turns holes of a sparse array into undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            const sparse = [1, , 3, , 5];
            const result = _tail(sparse);

            expect(result).toEqual([undefined, 3, undefined, 5]);
            expect(0 in result).toBe(true);
            expect(2 in result).toBe(true);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_tail([, 2])).toEqual([2]);
        });

        it("handles a large array", () => {
            const array = Array.from({ length: 500 }, (_, index) => index);

            expect(_tail(array)).toEqual(array.slice(1));
            expect(_tail(array)).toHaveLength(499);
        });
    });

    describe("other inputs", () => {
        it("returns an empty array for nullish input", () => {
            expect(_tail(null)).toEqual([]);
            expect(_tail(undefined)).toEqual([]);
            expect(_tail()).toEqual([]);
        });

        it("slices strings by character", () => {
            expect(_tail("abc")).toEqual(["b", "c"]);
            expect(_tail("a")).toEqual([]);
            expect(_tail("")).toEqual([]);
            expect(_tail("héllo")).toEqual(["é", "l", "l", "o"]);
            expect(_tail("😀ab")).toEqual(["\udE00", "a", "b"]);
            expect(_tail(Object("abc") as unknown as string)).toEqual(["b", "c"]);
        });

        it("accepts array-like objects, typed arrays and arguments objects, returning a plain array", () => {
            expect(_tail({ length: 3, 0: "a", 1: "b", 2: "c" })).toEqual(["b", "c"]);
            expect(_tail({ length: 1, 0: "a" })).toEqual([]);
            expect(_tail({ length: 0 } as unknown as string[])).toEqual([]);
            expect(_tail(new Uint8Array([1, 2, 3]))).toEqual([2, 3]);
            expect(Array.isArray(_tail(new Uint8Array([1, 2, 3])))).toBe(true);
            expect(_tail(new Float64Array([]))).toEqual([]);
            expect(_tail(getArguments(1, 2, 3) as unknown as number[])).toEqual([2, 3]);
            expect(Array.isArray(_tail(getArguments(1, 2)))).toBe(true);
            expect(
                _tail({
                    length: 3,
                    get 1() {
                        return "lazy";
                    },
                } as unknown as string[]),
            ).toEqual(["lazy", undefined]);
        });

        it("uses the length property the way lodash does", () => {
            expect(_tail({ length: "3", 0: "a", 1: "b", 2: "c" } as unknown as string[])).toEqual(["b", "c"]);
            expect(_tail({ length: 2.5, 0: "a", 1: "b", 2: "c" } as unknown as string[])).toEqual(["b"]);
            expect(_tail({ length: -1, 0: "a" } as unknown as string[])).toEqual([]);
            expect(_tail({ length: NaN, 0: "a" } as unknown as string[])).toEqual([]);
            expect(_tail({ length: Infinity, 0: "a" } as unknown as string[])).toEqual([]);
        });

        it("returns an empty array for values without a usable length", () => {
            expect(_tail({ 0: "a", 1: "b" } as unknown as string[])).toEqual([]);
            expect(_tail({ a: 1 } as unknown as number[])).toEqual([]);
            expect(_tail(new Set([1, 2]) as unknown as number[])).toEqual([]);
            expect(_tail(new Map([[1, 2]]) as unknown as number[])).toEqual([]);
            expect(_tail(5 as unknown as number[])).toEqual([]);
            expect(_tail(true as unknown as number[])).toEqual([]);
            expect(_tail(Object(3) as unknown as number[])).toEqual([]);
            expect(_tail(new Date(0) as unknown as number[])).toEqual([]);
            expect(_tail((() => 1) as unknown as number[])).toEqual([]);
        });

        it("ignores extra arguments", () => {
            expect((_tail as unknown as (a: number[], b: number) => number[])([1, 2, 3], 2)).toEqual([2, 3]);
        });
    });

    describe("typing", () => {
        it("drops the first tuple member and otherwise keeps the element type", () => {
            const fromTuple: [string, boolean] = _tail([1, "a", true] as const);
            const fromList: number[] = _tail([1, 2, 3]);
            const fromNullable: string[] = _tail(null as string[] | null);

            expect(fromTuple).toEqual(["a", true]);
            expect(fromList).toEqual([2, 3]);
            expect(fromNullable).toEqual([]);
        });
    });
});
