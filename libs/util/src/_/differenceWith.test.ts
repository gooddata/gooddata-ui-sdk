// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _differenceWith } from "./differenceWith.js";

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
const isNegativeZero = (value: number): boolean => Object.is(value, -0);

// Expected values match lodash-es@4.18.1 `differenceWith`.
describe("differenceWith", () => {
    describe("comparator", () => {
        it("excludes the values the comparator matches, keeping order and duplicates", () => {
            const objects = [
                { x: 1, y: 2 },
                { x: 2, y: 1 },
            ];

            expect(_differenceWith(objects, [{ x: 1, y: 2 }], deepEqual)).toEqual([{ x: 2, y: 1 }]);
            expect(_differenceWith(objects, [{ x: 2 }], byX)).toEqual([{ x: 1, y: 2 }]);
            expect(_differenceWith([1, 1, 2, 2, 3], [2], strictEqual)).toEqual([1, 1, 3]);
            expect(_differenceWith([1, 2], [1, 2], strictEqual)).toEqual([]);
        });

        it("calls the comparator with (arrayValue, otherValue) and an undefined this until a match", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];

            _differenceWith(["a", "b"], ["x", "y"], function (this: unknown, a, b) {
                calls.push([a, b]);
                bindings.push(this);

                return false;
            });

            expect(calls).toEqual([
                ["a", "x"],
                ["a", "y"],
                ["b", "x"],
                ["b", "y"],
            ]);
            expect(bindings).toEqual([undefined, undefined, undefined, undefined]);

            let count = 0;

            _differenceWith([1, 2, 3], [1, 2, 3], (a, b) => {
                count++;

                return a === b;
            });

            expect(count).toBe(6);
        });

        it("treats any truthy comparator result as a match", () => {
            const numeric = (a: number, b: number) => (a === b ? 1 : 0) as unknown as boolean;
            const stringy = (a: number, b: number) => (a === b ? "yes" : "") as unknown as boolean;

            expect(_differenceWith([1, 2, 3], [2], numeric)).toEqual([1, 3]);
            expect(_differenceWith([1, 2], [2], stringy)).toEqual([1]);
        });

        it("propagates errors thrown by the comparator", () => {
            expect(() =>
                _differenceWith([1], [2], () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });

        it("falls back to SameValueZero without a comparator", () => {
            const objects = [{ x: 1, y: 2 }];

            expect(_differenceWith([1, 2, 3], [2])).toEqual([1, 3]);
            expect(_differenceWith(objects, [{ x: 1, y: 2 }])).toEqual(objects);
            expect(_differenceWith([NaN, 1], [NaN])).toEqual([1]);
            expect(_differenceWith([1, 2])).toEqual([1, 2]);
        });

        it("takes the last argument as the comparator unless it is an array-like object", () => {
            const notLast = strictEqual as unknown as number[];

            expect(_differenceWith([1, 2, 3], notLast)).toEqual([1, 2, 3]);
            expect(_differenceWith([1, 2, 3], notLast, [2])).toEqual([1, 3]);
            expect(_differenceWith([1, 2, 3], [2], [3])).toEqual([1]);
            expect(_differenceWith([1, 2], [1], { length: 0 } as unknown as number[])).toEqual([2]);
            // as in lodash, any other last argument is the comparator, only called when there are values
            const oddComparator = "x" as unknown as number[];

            expect(_differenceWith([-0, 1], oddComparator).map(isNegativeZero)).toEqual([true, false]);
            expect(() => _differenceWith([1, 2], [1], "x" as unknown as number[])).toThrow(TypeError);
        });

        it("keeps -0 as it is with a comparator, but normalises it to 0 without one", () => {
            const seen: boolean[][] = [];

            _differenceWith([-0], [0], (a, b) => {
                seen.push([Object.is(a, -0), Object.is(b, 0)]);

                return false;
            });

            expect(seen).toEqual([[true, true]]);

            const withComparator = _differenceWith([-0, 0, 1], [2], strictEqual);

            expect(withComparator.map(isNegativeZero)).toEqual([true, false, false]);
            expect(_differenceWith([-0, 0, 1], [2]).map(isNegativeZero)).toEqual([false, false, false]);
            expect(_differenceWith([-0, 0, 1], [0], Object.is).map(isNegativeZero)).toEqual([true, false]);
            expect(_differenceWith([NaN, 1], [NaN], Object.is)).toEqual([1]);
        });
    });

    describe("values", () => {
        it("accepts several value arrays, taking their entries as values without flattening deeper", () => {
            expect(_differenceWith([1, 2, 3, 4], [1], [2], strictEqual)).toEqual([3, 4]);

            const mixed: (number | number[])[] = [1, [2]];

            expect(_differenceWith(mixed, [[2]], deepEqual)).toEqual([1]);
            expect(_differenceWith(mixed, [[2]], strictEqual)).toEqual([1, [2]]);

            const nested: (number | number[])[] = [1, 2, [3]];

            expect(_differenceWith(nested, [[1], [2]], strictEqual)).toEqual([1, 2, [3]]);
        });

        it("skips values that are not array-like objects", () => {
            const text = "1" as unknown as number[];
            const digit = 2 as unknown as number[];
            const nothing = null as unknown as number[];
            const missing = undefined as unknown as number[];

            expect(_differenceWith([1, 2, 3], text, digit, [3], strictEqual)).toEqual([1, 2]);
            expect(_differenceWith([1, 2, 3], nothing, missing, strictEqual)).toEqual([1, 2, 3]);
            expect(_differenceWith([1, 2], { 0: 1 } as unknown as number[], strictEqual)).toEqual([1, 2]);
            expect(_differenceWith([1, 2], new Set([1]) as unknown as number[], strictEqual)).toEqual([1, 2]);
            expect(_differenceWith([1, 2], { 0: 1, length: 1 }, strictEqual)).toEqual([2]);
        });

        it("returns a copy when there is nothing to exclude", () => {
            const array = [1, 2];

            expect(_differenceWith(array, [], strictEqual)).toEqual([1, 2]);
            expect(_differenceWith(array, [], strictEqual)).not.toBe(array);
            expect(_differenceWith([], [1], strictEqual)).toEqual([]);
        });
    });

    describe("array", () => {
        it("returns an empty array when the array is not an array-like object", () => {
            expect(_differenceWith(null, [1], deepEqual)).toEqual([]);
            expect(_differenceWith(undefined, [1], deepEqual)).toEqual([]);
            expect(_differenceWith("abc" as unknown as string[], ["a"], strictEqual)).toEqual([]);
            expect(_differenceWith(1 as unknown as number[], [1], strictEqual)).toEqual([]);
            expect((_differenceWith as unknown as () => unknown[])()).toEqual([]);
        });

        it("accepts array-like objects, arguments objects and typed arrays", () => {
            expect(_differenceWith({ length: 2, 0: "a", 1: "b" }, ["a"], strictEqual)).toEqual(["b"]);

            const args = getArguments(1, 2, 3) as unknown as number[];

            expect(_differenceWith(args, [2], strictEqual)).toEqual([1, 3]);
            expect(_differenceWith(new Uint8Array([1, 2, 3]), [2], strictEqual)).toEqual([1, 3]);
        });

        it("keeps elements by reference, leaves the inputs untouched and fills sparse holes", () => {
            const first = { x: 1 };
            const second = { x: 2 };
            const array = [first, second];
            const values = [{ x: 9 }];
            const result = _differenceWith(array, values, byX);

            expect(result[0]).toBe(first);
            expect(result[1]).toBe(second);
            expect(array).toEqual([first, second]);
            expect(values).toEqual([{ x: 9 }]);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_differenceWith([1, , 3], [1], strictEqual)).toEqual([undefined, 3]);
        });

        it("handles large inputs with and without a comparator", () => {
            const big = Array.from({ length: 300 }, (_, index) => ({ x: index }));
            const numbers = Array.from({ length: 300 }, (_, index) => index);

            expect(_differenceWith(big, [{ x: 5 }, { x: 299 }], byX)).toHaveLength(298);
            expect(_differenceWith([{ x: 5 }, { x: 999 }], big, byX)).toEqual([{ x: 999 }]);
            expect(_differenceWith(big, big.slice(100), byX)).toHaveLength(100);
            expect(_differenceWith(big, big.slice(100))).toHaveLength(100);
            expect(_differenceWith(numbers, numbers.slice(0, 250))).toHaveLength(50);
        });

        it("works with symbols, bigints and class instances", () => {
            const symbol = Symbol("s");

            class Point {
                constructor(public x: number) {}
            }

            expect(_differenceWith([symbol, 1], [symbol], strictEqual)).toEqual([1]);
            expect(_differenceWith([1n, 2n], [2n], strictEqual)).toEqual([1n]);

            const points = [new Point(1), new Point(2)];

            expect(_differenceWith(points, [new Point(2)], byX)).toEqual([new Point(1)]);
        });
    });

    describe("typing", () => {
        it("returns the element type of the first array and types the comparator by both sides", () => {
            const points: IPoint[] = _differenceWith([{ x: 1 }], [{ x: 1, y: 2 }], byX);
            const mixed: number[] = _differenceWith([1, 2], ["2"], (a: number, b: string) => String(a) === b);
            const plain: string[] = _differenceWith(["a"], ["a"]);

            expect(points).toEqual([]);
            expect(mixed).toEqual([1]);
            expect(plain).toEqual([]);
        });
    });
});
