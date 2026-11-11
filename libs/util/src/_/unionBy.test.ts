// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _unionBy } from "./unionBy.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

interface IPoint {
    x: number;
    y?: number;
}

// Expected values match lodash-es@4.18.1 `unionBy`.
describe("unionBy", () => {
    describe("iteratee", () => {
        it("keeps the first value of each criterion across all arrays, in order", () => {
            expect(_unionBy([2.1], [1.2, 2.3], Math.floor)).toEqual([2.1, 1.2]);
            expect(_unionBy([{ x: 1 }], [{ x: 2 }, { x: 1 }], "x")).toEqual([{ x: 1 }, { x: 2 }]);
            expect(_unionBy([1, 2], [2, 3], [3, 4], (value) => value)).toEqual([1, 2, 3, 4]);
            expect(_unionBy([2.1, 2.9], [2.3], Math.floor)).toEqual([2.1]);
            expect(_unionBy([3, 1], [2, 3, 1], (value) => value)).toEqual([3, 1, 2]);
        });

        it("accepts property paths, matches objects and indices as shorthands, but never an array", () => {
            const nested = [{ a: { b: 1 } }];
            const pairs = [
                [1, 9],
                [2, 8],
            ];

            expect(_unionBy(nested, [{ a: { b: 1 } }, { a: { b: 2 } }], "a.b")).toEqual([
                { a: { b: 1 } },
                { a: { b: 2 } },
            ]);
            expect(_unionBy([{ a: 1 }, { a: 2 }], [{ a: 1 }], { a: 1 })).toEqual([{ a: 1 }, { a: 2 }]);
            expect(_unionBy(pairs, [[3, 9]], 1)).toEqual([
                [1, 9],
                [2, 8],
            ]);
            // as in lodash, an array last argument is always a list to merge, not a matches-property pair
            expect(_unionBy([{ a: { b: 1 } }], [{ a: { b: 1 } }], ["a", "b"] as unknown as string)).toEqual([
                { a: { b: 1 } },
                { a: { b: 1 } },
                "a",
                "b",
            ]);
        });

        it("uses the identity when the last argument is an array-like object, undefined or null", () => {
            expect(_unionBy([2], [1, 2])).toEqual([2, 1]);
            expect(_unionBy([1, 2], [2], undefined)).toEqual([1, 2]);
            expect(_unionBy([1, 2], [2], null as unknown as undefined)).toEqual([1, 2]);
            expect(_unionBy([1, 2, 2])).toEqual([1, 2]);
            expect(_unionBy(Math.floor)).toEqual([]);
            expect(_unionBy()).toEqual([]);
        });

        it("takes a string last argument as the iteratee", () => {
            expect(_unionBy([1, 2], [2], "x" as unknown as number[])).toEqual([1]);
            expect(_unionBy([{ x: 1 }, { x: 2 }], "x")).toEqual([{ x: 1 }, { x: 2 }]);
        });

        it("invokes the iteratee with the value only and an undefined this, in order", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];

            _unionBy(["a", "b"], ["c"], function (this: unknown, ...args: unknown[]) {
                calls.push(args);
                bindings.push(this);

                return args[0];
            });

            expect(calls).toEqual([["a"], ["b"], ["c"]]);
            expect(bindings).toEqual([undefined, undefined, undefined]);
        });

        it("compares criteria with SameValueZero and keeps references", () => {
            const point = { x: 1 };
            const nullish = [undefined, null];

            expect(_unionBy([NaN, 1], [NaN], (value) => value)).toEqual([NaN, 1]);
            expect(_unionBy([1, "1"], ["1"], (value) => value)).toEqual([1, "1"]);
            expect(_unionBy([1, "1"], ["1"], String)).toEqual([1]);
            expect(_unionBy(nullish, [null, undefined], (value) => value)).toEqual([undefined, null]);
            expect(_unionBy([point], [{ x: 1 }], "x")[0]).toBe(point);
            expect(_unionBy([{ x: 1 }], [{ x: 1 }], (value) => value)).toHaveLength(2);
        });

        it("propagates errors thrown by the iteratee", () => {
            expect(() =>
                _unionBy([1], [2], () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("arrays", () => {
        it("normalises -0 to 0 in the result", () => {
            const isPositiveZero = (value: number) => Object.is(value, 0);

            expect(_unionBy([-0, 1], [0], (value) => value).map(isPositiveZero)).toEqual([true, false]);
            expect(_unionBy([-0], [0]).map(isPositiveZero)).toEqual([true]);
        });

        it("skips arguments that are not array-like objects", () => {
            const digit = 2 as unknown as number[];
            const text = "3" as unknown as number[];

            expect(_unionBy(null, [1])).toEqual([1]);
            expect(_unionBy(undefined, [1])).toEqual([1]);
            expect(_unionBy(1 as unknown as number[], [1])).toEqual([1]);
            expect(_unionBy("ab" as unknown as string[], ["a"])).toEqual(["a"]);
            expect(_unionBy({ a: 1 } as unknown as number[], [1])).toEqual([1]);
            expect(_unionBy([1, 2], null, (value) => value)).toEqual([1, 2]);
            expect(_unionBy([1], digit, text, null, [4], (value) => value)).toEqual([1, 4]);
            expect(_unionBy([], [], (value) => value)).toEqual([]);
        });

        it("accepts array-likes, arguments objects and typed arrays without flattening nested ones", () => {
            const args = getArguments(1, 2) as unknown as number[];
            const mixed: (number | number[])[] = [[1], 2];

            const arrayLike = { length: 2, 0: 1, 1: 2 };

            expect(_unionBy(arrayLike, { length: 1, 0: 2 }, (value) => value)).toEqual([1, 2]);
            expect(_unionBy(args, [2])).toEqual([1, 2]);
            const bytes = new Uint8Array([1, 2]);

            expect(_unionBy(bytes, new Uint8Array([2, 3]), (value) => value)).toEqual([1, 2, 3]);
            expect(_unionBy(mixed, [[1]], (value) => value)).toEqual([[1], 2, [1]]);
        });

        it("visits holes as undefined, keeps duplicates out and leaves the inputs untouched", () => {
            const first = [1, 1, 2, 2];
            const second = [2];

            // oxlint-disable-next-line no-sparse-arrays
            expect(_unionBy([1, , 3], [undefined, 3], (value) => value)).toEqual([1, undefined, 3]);
            expect(_unionBy(first, second, (value) => value)).toEqual([1, 2]);
            expect(first).toEqual([1, 1, 2, 2]);
            expect(second).toEqual([2]);
        });

        it("handles large inputs", () => {
            const big = Array.from({ length: 300 }, (_, index) => ({ x: index % 150 }));
            const numbers = Array.from({ length: 300 }, (_, index) => index);

            expect(_unionBy(big, big.slice(0, 200), "x")).toHaveLength(150);
            expect(
                _unionBy(
                    numbers,
                    numbers.map((value) => value + 150),
                ),
            ).toHaveLength(450);
            expect(
                _unionBy(
                    Array.from({ length: 300 }, () => NaN),
                    [NaN],
                ),
            ).toEqual([NaN]);
        });
    });

    describe("typing", () => {
        it("returns the element type of the arrays", () => {
            const points: IPoint[] = _unionBy([{ x: 1, y: 2 }], [{ x: 1 }], "x");
            const numbers: number[] = _unionBy([1.1], [1.9], Math.floor);
            const plain: string[] = _unionBy(["a"], ["a"]);

            expect(points).toEqual([{ x: 1, y: 2 }]);
            expect(numbers).toEqual([1.1]);
            expect(plain).toEqual(["a"]);
        });
    });
});
