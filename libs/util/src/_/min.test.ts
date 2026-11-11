// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _min } from "./min.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `min`.
describe("min", () => {
    describe("numbers", () => {
        it("returns the smallest number", () => {
            expect(_min([4, 2, 8, 6])).toBe(2);
            expect(_min([1, 2, 3])).toBe(1);
            expect(_min([3, 2, 1])).toBe(1);
            expect(_min([-1, -2, -3])).toBe(-3);
            expect(_min([1])).toBe(1);
            expect(_min([1.5, 1.25])).toBe(1.25);
            expect(_min([Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])).toBe(Number.MAX_SAFE_INTEGER);
            expect(_min([Number.MIN_VALUE, 0])).toBe(0);
        });

        it("handles infinities", () => {
            expect(_min([Infinity, 1])).toBe(1);
            expect(_min([-Infinity, 1])).toBe(-Infinity);
            expect(_min([1, Infinity, -Infinity])).toBe(-Infinity);
        });

        it("keeps the first of equal values, so 0 before -0 stays 0", () => {
            expect(Object.is(_min([0, -0]), 0)).toBe(true);
            expect(Object.is(_min([-0, 0]), -0)).toBe(true);
            expect(Object.is(_min([-0]), -0)).toBe(true);
        });

        it("skips NaN unless nothing else is comparable", () => {
            expect(_min([3, NaN, 1])).toBe(1);
            expect(_min([NaN, 1])).toBe(1);
            expect(_min([NaN])).toBeUndefined();
            expect(_min([NaN, NaN])).toBeUndefined();
        });

        it("handles a large array", () => {
            const values = Array.from({ length: 1000 }, (_, index) => ((index * 7919) % 1000) + 1);

            expect(_min(values)).toBe(1);
            expect(_min(Array.from({ length: 5 }, (_, index) => -index))).toBe(-4);
        });
    });

    describe("other values", () => {
        it("returns undefined for empty, nullish and falsey input", () => {
            expect(_min([])).toBeUndefined();
            expect(_min(null)).toBeUndefined();
            expect(_min(undefined)).toBeUndefined();
            expect(_min("" as unknown as string[])).toBeUndefined();
            expect(_min(0 as unknown as number[])).toBeUndefined();
        });

        it("skips null and undefined elements", () => {
            expect(_min([null, undefined])).toBeUndefined();
            expect(_min([null, 1])).toBe(1);
            expect(_min([undefined, 2, undefined])).toBe(2);
            expect(_min([3, null, 1])).toBe(1);
            expect(_min([undefined])).toBeUndefined();
        });

        it("compares strings lexicographically", () => {
            expect(_min(["a", "b", "c"])).toBe("a");
            expect(_min(["b", "a"])).toBe("a");
            expect(_min(["10", "9"])).toBe("10");
            expect(_min(["abc", "abd"])).toBe("abc");
            expect(_min(["", "a"])).toBe("");
        });

        it("compares mixed primitives with the < operator's coercion", () => {
            expect(_min<number | string>([2, "1"])).toBe("1");
            expect(_min<number | string>(["2", 1])).toBe(1);
            expect(_min<number | string>([2, "10"])).toBe(2);
            expect(_min<number | string>(["10", 2])).toBe(2);
            expect(_min<number | boolean>([true, 2])).toBe(true);
            expect(_min<number | boolean>([3, true, 2])).toBe(true);
            expect(_min([true, false])).toBe(false);
            expect(_min([true])).toBe(true);
            expect(_min([10n, 5n])).toBe(5n);
            expect(_min<number | bigint>([10, 5n])).toBe(5n);
        });

        it("compares dates and objects through valueOf, returning the element by reference", () => {
            const earlier = new Date(1);
            const later = new Date(2);
            const five = { valueOf: () => 5 };

            expect(_min([earlier, later])).toBe(earlier);
            expect(_min([later, earlier])).toBe(earlier);
            expect(_min<unknown>([five, 7])).toBe(five);
            expect(_min<unknown>([7, five])).toBe(five);
            expect(_min<unknown>([five, 3])).toBe(3);
        });

        it("keeps the first element when nothing compares less", () => {
            const first = {};
            const second = {};
            const a = [1];
            const b = [2];

            expect(_min([first, second])).toBe(first);
            expect(_min([a, b])).toBe(a);
            expect(_min([b, a])).toBe(a);
            expect(_min([/b/, /a/])).toEqual(/a/);
        });

        it("ignores a leading symbol and throws when a symbol is compared, as lodash does", () => {
            const symbol = Symbol("s");

            expect(_min<unknown>([symbol, 1])).toBe(1);
            expect(_min([symbol, symbol])).toBeUndefined();
            expect(() => _min<unknown>([1, symbol])).toThrow(TypeError);
        });
    });

    describe("inputs", () => {
        it("accepts array-like objects, typed arrays and arguments objects", () => {
            expect(_min({ length: 2, 0: 5, 1: 9 })).toBe(5);
            expect(_min({ length: 2, 0: 9, 1: 5 })).toBe(5);
            expect(_min({ length: 0 } as unknown as number[])).toBeUndefined();
            expect(_min("cab" as unknown as string[])).toBe("a");
            expect(_min(new Uint8Array([3, 200, 1]))).toBe(1);
            expect(_min(new Float64Array([1.5, -0.5]))).toBe(-0.5);
            expect(_min(getArguments(3, 9, 4) as unknown as number[])).toBe(3);
        });

        it("uses the length property literally, as lodash does", () => {
            expect(_min({ length: "2", 0: 2, 1: 1 } as unknown as number[])).toBe(1);
            expect(_min({ length: 1.5, 0: 2, 1: 1 } as unknown as number[])).toBe(1);
            expect(_min({ length: -1, 0: 1 } as unknown as number[])).toBeUndefined();
            expect(_min({ 0: 1, 1: 2 } as unknown as number[])).toBeUndefined();
            expect(_min(new Set([1, 2]) as unknown as number[])).toBeUndefined();
        });

        it("skips holes in sparse arrays", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_min([5, , 1, , 3])).toBe(1);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_min([, ,])).toBeUndefined();
        });

        it("does not mutate the input and ignores extra arguments", () => {
            const values = [3, 1, 2];

            expect(_min(values)).toBe(1);
            expect(values).toEqual([3, 1, 2]);
            expect((_min as unknown as (a: number[], b: number[]) => number)([5, 1], [0])).toBe(1);
        });
    });

    describe("typing", () => {
        it("narrows a non-empty tuple to the element type and otherwise allows undefined", () => {
            const fromTuple: number = _min([1, 2] as const);
            const fromList: string | undefined = _min(["a", "b"]);
            const fromNullable: number | undefined = _min(null as number[] | null);

            expect(fromTuple).toBe(1);
            expect(fromList).toBe("a");
            expect(fromNullable).toBeUndefined();
        });
    });
});
