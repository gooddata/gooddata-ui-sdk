// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _max } from "./max.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `max`.
describe("max", () => {
    describe("numbers", () => {
        it("returns the largest number", () => {
            expect(_max([4, 2, 8, 6])).toBe(8);
            expect(_max([1, 2, 3])).toBe(3);
            expect(_max([3, 2, 1])).toBe(3);
            expect(_max([-1, -2, -3])).toBe(-1);
            expect(_max([1])).toBe(1);
            expect(_max([1.5, 1.25])).toBe(1.5);
            expect(_max([Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])).toBe(Number.MAX_VALUE);
            expect(_max([Number.MIN_VALUE, 0])).toBe(Number.MIN_VALUE);
        });

        it("handles infinities", () => {
            expect(_max([Infinity, 1])).toBe(Infinity);
            expect(_max([-Infinity, 1])).toBe(1);
            expect(_max([1, Infinity, -Infinity])).toBe(Infinity);
        });

        it("keeps the first of equal values, so -0 before 0 stays -0", () => {
            expect(Object.is(_max([-0, 0]), -0)).toBe(true);
            expect(Object.is(_max([0, -0]), 0)).toBe(true);
            expect(Object.is(_max([-0]), -0)).toBe(true);
        });

        it("skips NaN unless nothing else is comparable", () => {
            expect(_max([1, NaN, 3])).toBe(3);
            expect(_max([NaN, 1])).toBe(1);
            expect(_max([NaN])).toBeUndefined();
            expect(_max([NaN, NaN])).toBeUndefined();
        });

        it("handles a large array", () => {
            const values = Array.from({ length: 1000 }, (_, index) => (index * 7919) % 1000);

            expect(_max(values)).toBe(999);
            expect(Object.is(_max(Array.from({ length: 5 }, (_, index) => -index)), -0)).toBe(true);
        });
    });

    describe("other values", () => {
        it("returns undefined for empty, nullish and falsey input", () => {
            expect(_max([])).toBeUndefined();
            expect(_max(null)).toBeUndefined();
            expect(_max(undefined)).toBeUndefined();
            expect(_max("" as unknown as string[])).toBeUndefined();
            expect(_max(0 as unknown as number[])).toBeUndefined();
        });

        it("skips null and undefined elements", () => {
            expect(_max([null, undefined])).toBeUndefined();
            expect(_max([null, 1])).toBe(1);
            expect(_max([undefined, 2, undefined])).toBe(2);
            expect(_max([1, null, 3])).toBe(3);
            expect(_max([undefined])).toBeUndefined();
        });

        it("compares strings lexicographically", () => {
            expect(_max(["a", "b", "c"])).toBe("c");
            expect(_max(["b", "a"])).toBe("b");
            expect(_max(["10", "9"])).toBe("9");
            expect(_max(["abc", "abd"])).toBe("abd");
            expect(_max(["", "a"])).toBe("a");
        });

        it("compares mixed primitives with the > operator's coercion", () => {
            expect(_max<number | string>([1, "2"])).toBe("2");
            expect(_max<number | string>(["1", 2])).toBe(2);
            expect(_max<number | string>([2, "10"])).toBe("10");
            expect(_max<number | string>(["10", 2])).toBe("10");
            expect(_max<number | boolean>([true, 2])).toBe(2);
            expect(_max<number | boolean>([1, true, 3])).toBe(3);
            expect(_max([true, false])).toBe(true);
            expect(_max([false])).toBe(false);
            expect(_max([10n, 5n])).toBe(10n);
            expect(_max<number | bigint>([1, 10n])).toBe(10n);
        });

        it("compares dates and objects through valueOf, returning the element by reference", () => {
            const earlier = new Date(1);
            const later = new Date(2);
            const five = { valueOf: () => 5 };

            expect(_max([earlier, later])).toBe(later);
            expect(_max([later, earlier])).toBe(later);
            expect(_max<unknown>([five, 3])).toBe(five);
            expect(_max<unknown>([3, five])).toBe(five);
            expect(_max<unknown>([five, 7])).toBe(7);
        });

        it("keeps the first element when nothing compares greater", () => {
            const first = {};
            const second = {};
            const a = [1];
            const b = [2];

            expect(_max([first, second])).toBe(first);
            expect(_max([a, b])).toBe(b);
            expect(_max([b, a])).toBe(b);
            expect(_max([/a/, /b/])).toEqual(/b/);
            expect(_max([Object(2), Object(2)].map((value, index) => ({ value, index })))).toEqual({
                value: Object(2),
                index: 0,
            });
        });

        it("ignores a leading symbol and throws when a symbol is compared, as lodash does", () => {
            const symbol = Symbol("s");

            expect(_max<unknown>([symbol, 1])).toBe(1);
            expect(_max([symbol, symbol])).toBeUndefined();
            expect(() => _max<unknown>([1, symbol])).toThrow(TypeError);
        });
    });

    describe("inputs", () => {
        it("accepts array-like objects, typed arrays and arguments objects", () => {
            expect(_max({ length: 2, 0: 5, 1: 9 })).toBe(9);
            expect(_max({ length: 2, 0: 9, 1: 5 })).toBe(9);
            expect(_max({ length: 0 } as unknown as number[])).toBeUndefined();
            expect(_max("abc" as unknown as string[])).toBe("c");
            expect(_max(new Uint8Array([1, 200, 3]))).toBe(200);
            expect(_max(new Float64Array([1.5, -0.5]))).toBe(1.5);
            expect(_max(getArguments(3, 9, 4) as unknown as number[])).toBe(9);
        });

        it("uses the length property literally, as lodash does", () => {
            expect(_max({ length: "2", 0: 1, 1: 2 } as unknown as number[])).toBe(2);
            expect(_max({ length: 1.5, 0: 1, 1: 2 } as unknown as number[])).toBe(2);
            expect(_max({ length: -1, 0: 1 } as unknown as number[])).toBeUndefined();
            expect(_max({ 0: 1, 1: 2 } as unknown as number[])).toBeUndefined();
            expect(_max(new Set([1, 2]) as unknown as number[])).toBeUndefined();
        });

        it("skips holes in sparse arrays", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_max([1, , 5, , 3])).toBe(5);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_max([, ,])).toBeUndefined();
        });

        it("does not mutate the input and ignores extra arguments", () => {
            const values = [3, 1, 2];

            expect(_max(values)).toBe(3);
            expect(values).toEqual([3, 1, 2]);
            expect((_max as unknown as (a: number[], b: number[]) => number)([1, 5], [9])).toBe(5);
        });
    });

    describe("typing", () => {
        it("narrows a non-empty tuple to the element type and otherwise allows undefined", () => {
            const fromTuple: number = _max([1, 2] as const);
            const fromList: string | undefined = _max(["a", "b"]);
            const fromNullable: number | undefined = _max(null as number[] | null);

            expect(fromTuple).toBe(2);
            expect(fromList).toBe("b");
            expect(fromNullable).toBeUndefined();
        });
    });
});
