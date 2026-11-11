// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _intersectionWith } from "./intersectionWith.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

interface IPoint {
    x: number;
    y?: number;
}

const byX = (a: IPoint, b: IPoint): boolean => a.x === b.x;
const deepEqual = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const strictEqual = (a: unknown, b: unknown): boolean => a === b;

// Expected values match lodash-es@4.18.1 `intersectionWith`.
describe("intersectionWith", () => {
    describe("comparator", () => {
        it("keeps the values of the first array that match a value in every other array", () => {
            const objects = [
                { x: 1, y: 2 },
                { x: 2, y: 1 },
            ];
            const others = [
                { x: 1, y: 1 },
                { x: 1, y: 2 },
            ];

            expect(_intersectionWith(objects, others, deepEqual)).toEqual([{ x: 1, y: 2 }]);
            expect(_intersectionWith(objects, [{ x: 2 }], byX)).toEqual([{ x: 2, y: 1 }]);
            expect(_intersectionWith([1, 2, 3, 4], [2, 3, 4], [3, 4], strictEqual)).toEqual([3, 4]);
            const numeric = (a: number, b: number) => (a === b ? 1 : 0) as unknown as boolean;

            expect(_intersectionWith([1, 2], [2], numeric)).toEqual([2]);
        });

        it("removes duplicates through the comparator as well, keeping the first value", () => {
            const points = [
                { x: 1, y: 2 },
                { x: 1, y: 3 },
            ];

            expect(_intersectionWith([1, 2, 3], [9], () => true)).toEqual([1]);
            expect(_intersectionWith([1, 1, 2, 2], [1, 2], strictEqual)).toEqual([1, 2]);
            expect(_intersectionWith(points, [{ x: 1 }], byX)).toEqual([{ x: 1, y: 2 }]);
        });

        it("calls the comparator with (arrayValue, otherValue) and an undefined this, result first", () => {
            const calls: string[] = [];
            const bindings: unknown[] = [];

            _intersectionWith(["a", "b"], ["c", "a"], ["a", "e"], function (this: unknown, a, b) {
                calls.push(a + b);
                bindings.push(this);

                return a === b;
            });

            // the result is checked first, then the other arrays from the last to the first
            expect(calls).toEqual(["aa", "ac", "aa", "ba", "ba", "be"]);
            expect(bindings.every((binding) => binding === undefined)).toBe(true);
        });

        it("stops once the result is as long as the shortest array", () => {
            let calls = 0;

            expect(
                _intersectionWith([1, 2, 3, 4, 5], [1], (a, b) => {
                    calls++;

                    return a === b;
                }),
            ).toEqual([1]);
            expect(calls).toBe(1);
        });

        it("falls back to SameValueZero without a comparator and only takes a function as comparator", () => {
            expect(_intersectionWith([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
            expect(_intersectionWith([{ x: 1 }], [{ x: 1 }])).toEqual([]);
            expect(_intersectionWith([1, 2, 3], [2, 3], [3])).toEqual([3]);
            expect(_intersectionWith([1, 2], [2], "x" as unknown as number[])).toEqual([]);
            expect(_intersectionWith([1, 2], strictEqual)).toEqual([1, 2]);
            expect(_intersectionWith([1, 1, 2], strictEqual)).toEqual([1, 2]);
            expect(_intersectionWith(strictEqual as unknown as number[])).toEqual([]);
            expect(_intersectionWith()).toEqual([]);
        });

        it("keeps -0 as it is with a comparator, but normalises it without one", () => {
            const isNegativeZero = (value: number) => Object.is(value, -0);

            expect(_intersectionWith([-0, 1], [0, 1], strictEqual).map(isNegativeZero)).toEqual([
                true,
                false,
            ]);
            expect(_intersectionWith([-0, 0], [-0], Object.is).map(isNegativeZero)).toEqual([true]);
            expect(_intersectionWith([-0, 1], [0]).map(isNegativeZero)).toEqual([false]);
            expect(_intersectionWith([NaN, 1], [NaN], Object.is)).toEqual([NaN]);
            expect(_intersectionWith([NaN, 1], [NaN], strictEqual)).toEqual([]);
        });

        it("propagates errors thrown by the comparator", () => {
            expect(() =>
                _intersectionWith([1], [2], () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("arrays", () => {
        it("returns an empty array when the first argument is not an array-like object", () => {
            expect(_intersectionWith(null, [1], strictEqual)).toEqual([]);
            expect(_intersectionWith(undefined, [1], strictEqual)).toEqual([]);
            expect(_intersectionWith(1 as unknown as number[], [1], strictEqual)).toEqual([]);
            expect(_intersectionWith("ab" as unknown as string[], ["a"], strictEqual)).toEqual([]);
            expect(_intersectionWith({ a: 1 } as unknown as number[], [1], strictEqual)).toEqual([]);
        });

        it("treats other arguments that are not array-like objects as empty, skipping the comparator", () => {
            let calls = 0;

            expect(
                _intersectionWith([1, 2], null as unknown as number[], (a, b) => {
                    calls++;

                    return a === b;
                }),
            ).toEqual([]);
            expect(calls).toBe(0);
            expect(_intersectionWith(["a"], "a" as unknown as string[], strictEqual)).toEqual([]);
            expect(_intersectionWith([1], [], strictEqual)).toEqual([]);
            expect(_intersectionWith([], [1], strictEqual)).toEqual([]);
        });

        it("accepts array-like objects, arguments objects and typed arrays", () => {
            const first = { length: 2, 0: 1, 1: 2 };
            const second = { length: 1, 0: 2 };

            expect(_intersectionWith(first, second, strictEqual)).toEqual([2]);
            const args = getArguments(1, 2) as unknown as number[];

            expect(_intersectionWith(args, [2], strictEqual)).toEqual([2]);
            expect(_intersectionWith(new Uint8Array([1, 2]), new Uint8Array([2]), strictEqual)).toEqual([2]);
        });

        it("keeps references, visits holes, compares nested values and leaves the inputs untouched", () => {
            const point = { x: 1 };
            const first = [1, 2];
            const second = [2];

            expect(_intersectionWith([point], [{ x: 1 }], byX)[0]).toBe(point);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_intersectionWith([1, , 3], [undefined, 3], strictEqual)).toEqual([undefined, 3]);
            expect(_intersectionWith([[1], [2]], [[2]], deepEqual)).toEqual([[2]]);
            expect(_intersectionWith([undefined, null], [null, undefined], strictEqual)).toEqual([
                undefined,
                null,
            ]);
            _intersectionWith(first, second, strictEqual);
            expect(first).toEqual([1, 2]);
            expect(second).toEqual([2]);
        });

        it("handles large inputs, symbols, bigints and class instances", () => {
            const big = Array.from({ length: 300 }, (_, index) => ({ x: index % 150 }));
            const numbers = Array.from({ length: 300 }, (_, index) => index);
            const shifted = numbers.map((value) => value + 150);
            const symbol = Symbol("s");

            class Point {
                constructor(public x: number) {}
            }

            expect(_intersectionWith(big, big.slice(0, 200), byX)).toHaveLength(150);
            expect(_intersectionWith(numbers, shifted)).toHaveLength(150);
            expect(_intersectionWith(numbers, [5, 5, 7], strictEqual)).toEqual([5, 7]);
            expect(_intersectionWith([symbol, 1], [symbol], strictEqual)).toEqual([symbol]);
            expect(_intersectionWith([1n, 2n], [2n], strictEqual)).toEqual([2n]);
            expect(_intersectionWith([new Point(1), new Point(2)], [new Point(2)], byX)).toEqual([
                new Point(2),
            ]);
        });
    });

    describe("typing", () => {
        it("returns the element type of the first array and types the comparator by both sides", () => {
            const mixedComparator = (a: number, b: number | string) => String(a) === b;
            const points: IPoint[] = _intersectionWith([{ x: 1, y: 2 }], [{ x: 1 }], byX);
            const mixed: number[] = _intersectionWith([1, 2], ["2"], mixedComparator);
            const plain: string[] = _intersectionWith(["a"], ["a"]);

            expect(points).toEqual([{ x: 1, y: 2 }]);
            expect(mixed).toEqual([2]);
            expect(plain).toEqual(["a"]);
        });
    });
});
