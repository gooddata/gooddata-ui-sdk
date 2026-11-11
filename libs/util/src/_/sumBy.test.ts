// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _sumBy } from "./sumBy.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `sumBy`.
describe("sumBy", () => {
    describe("iteratee", () => {
        it("sums the iteratee results", () => {
            const objects = [{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }];

            expect(_sumBy(objects, (object) => object.n)).toBe(20);
            expect(_sumBy(objects, "n")).toBe(20);
            expect(_sumBy([1, 2, 3], (value) => value * 2)).toBe(12);
        });

        it("accepts paths, matches objects, matches-property pairs and indices as shorthands", () => {
            expect(_sumBy([{ a: { b: 1 } }, { a: { b: 2 } }], "a.b")).toBe(3);
            // an array iteratee is a matches-property pair, never a path, as in lodash
            expect(_sumBy([{ a: { b: 1 } }], ["a", "b"] as unknown as string)).toBe(false);
            expect(_sumBy([{ a: 1 }, { a: 2 }], { a: 1 } as unknown as string)).toBe(1);
            expect(_sumBy([{ a: 1 }, { a: 2 }], ["a", 1] as unknown as string)).toBe(1);
            expect(
                _sumBy(
                    [
                        [1, 2],
                        [3, 4],
                    ],
                    1 as unknown as string,
                ),
            ).toBe(6);
        });

        it("uses the identity when no iteratee is given", () => {
            expect(_sumBy([1, 2, 3])).toBe(6);
            expect(_sumBy([1, 2, 3], undefined)).toBe(6);
            expect(_sumBy([1, 2, 3], null as unknown as string)).toBe(6);
        });

        it("invokes the iteratee with the value only and an undefined this, and propagates errors", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];
            let empties = 0;

            _sumBy([1, 2], function (this: unknown, ...args: unknown[]) {
                calls.push(args);
                bindings.push(this);

                return 0;
            });
            _sumBy([], () => empties++);

            expect(calls).toEqual([[1], [2]]);
            expect(bindings).toEqual([undefined, undefined]);
            expect(empties).toBe(0);
            expect(() =>
                _sumBy([1], () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("values", () => {
        it("skips undefined results and returns undefined when nothing is left, as lodash does", () => {
            expect(_sumBy([1, undefined, 2])).toBe(3);

            const skipTwo = (value: number) => (value === 2 ? undefined : value) as unknown as number;

            expect(_sumBy([1, 2, 3], skipTwo)).toBe(4);
            expect(_sumBy([undefined, undefined])).toBeUndefined();
            expect(_sumBy([1, 2], () => undefined as unknown as number)).toBeUndefined();
            // oxlint-disable-next-line no-sparse-arrays
            expect(_sumBy([1, , 3])).toBe(4);
        });

        it("adds with the + operator, so other types coerce or concatenate", () => {
            expect(_sumBy([null, 1])).toBe(1);
            expect(_sumBy([null])).toBeNull();
            expect(_sumBy([null, 2])).toBe(2);
            expect(_sumBy([1, NaN])).toBeNaN();
            expect(_sumBy(["a", "b"])).toBe("ab");
            expect(_sumBy(["1", 2])).toBe("12");
            expect(_sumBy([1, "2"])).toBe("12");
            expect(_sumBy([true, true])).toBe(2);
            expect(_sumBy([{ valueOf: () => 1 }, { valueOf: () => 2 }])).toBe(3);
            expect(typeof _sumBy([new Date(1), new Date(2)])).toBe("string");
            expect(_sumBy([[1], [2]])).toBe("12");
            expect(_sumBy([1n, 2n])).toBe(3n);
            expect(() => _sumBy([1n, 2])).toThrow(TypeError);
            expect(() => _sumBy([Symbol("a"), 1])).toThrow(TypeError);
            expect(typeof _sumBy([Symbol("a")])).toBe("symbol");
        });

        it("handles signed zero, negatives, floats, infinities and a large array", () => {
            expect(Object.is(_sumBy([-0]), -0)).toBe(true);
            expect(Object.is(_sumBy([-0, 0]), 0)).toBe(true);
            expect(_sumBy([-1, -2])).toBe(-3);
            expect(_sumBy([0.1, 0.2])).toBeCloseTo(0.3);
            expect(_sumBy([Infinity, -Infinity])).toBeNaN();
            expect(_sumBy(Array.from({ length: 10000 }, (_, index) => index))).toBe(49995000);
        });
    });

    describe("collections", () => {
        it("returns 0 for empty, nullish and falsey input", () => {
            expect(_sumBy([])).toBe(0);
            expect(_sumBy(null)).toBe(0);
            expect(_sumBy(undefined)).toBe(0);
            expect((_sumBy as unknown as () => number)()).toBe(0);
            expect(_sumBy({ length: 0 } as unknown as number[])).toBe(0);
            expect(_sumBy(5 as unknown as number[])).toBe(0);
            expect(_sumBy({ a: 1, b: 2 } as unknown as number[])).toBe(0);
            expect(_sumBy(new Map([[1, 2]]) as unknown as number[])).toBe(0);
            expect(_sumBy(new Set([1, 2]) as unknown as number[])).toBe(0);
        });

        it("accepts strings, array-like objects, arguments objects and typed arrays", () => {
            expect(_sumBy("123" as unknown as string[])).toBe("123");
            expect(_sumBy("123" as unknown as string[], Number)).toBe(6);
            expect(_sumBy({ length: 2, 0: 1, 1: 2 })).toBe(3);
            expect(_sumBy({ length: "2", 0: 1, 1: 2 } as unknown as number[])).toBe(3);
            expect(_sumBy(getArguments(1, 2, 3) as unknown as number[])).toBe(6);
            expect(_sumBy(new Uint8Array([1, 2, 3]))).toBe(6);
        });

        it("does not mutate the input and ignores extra arguments", () => {
            const values = [1, 2];

            expect(_sumBy(values)).toBe(3);
            expect(values).toEqual([1, 2]);

            type WithExtra = (a: number[], b: (v: number) => number, c: string) => number;

            const withExtra = _sumBy as unknown as WithExtra;

            expect(withExtra(values, (v) => v, "x")).toBe(3);
        });
    });

    describe("typing", () => {
        it("returns a number and types the iteratee by the element", () => {
            const total: number = _sumBy([{ n: 1 }, { n: 2 }], (object) => object.n);
            const byName: number = _sumBy([{ n: 1 }], "n");

            expect(total).toBe(3);
            expect(byName).toBe(1);
        });
    });
});
