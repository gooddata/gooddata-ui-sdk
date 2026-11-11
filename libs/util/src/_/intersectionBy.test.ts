// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _intersectionBy } from "./intersectionBy.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

interface IPoint {
    x: number;
    y?: number;
}

// Expected values match lodash-es@4.18.1 `intersectionBy`.
describe("intersectionBy", () => {
    describe("iteratee", () => {
        it("keeps the values of the first array whose criterion appears in every other array", () => {
            expect(_intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor)).toEqual([2.1]);
            expect(_intersectionBy([{ x: 1 }], [{ x: 2 }, { x: 1 }], "x")).toEqual([{ x: 1 }]);
            expect(_intersectionBy([1, 2, 3, 4], [2, 3, 4], [3, 4], (value) => value)).toEqual([3, 4]);
            expect(_intersectionBy([1.1, 2.2, 3.3], [2.9, 3.1], [3.5], Math.floor)).toEqual([3.3]);
        });

        it("keeps the first value of each criterion, in the order of the first array", () => {
            expect(_intersectionBy([2.1, 2.9, 1.2], [2.3], Math.floor)).toEqual([2.1]);
            expect(_intersectionBy([3, 1, 2], [2, 3, 1], (value) => value)).toEqual([3, 1, 2]);
            expect(_intersectionBy([1, 1, 2, 2], [1, 2], (value) => value)).toEqual([1, 2]);
            expect(_intersectionBy([{ x: 1 }, { x: 1 }], [{ x: 1 }], "x")).toEqual([{ x: 1 }]);
        });

        it("accepts property paths, matches objects and indices as shorthands, but never an array", () => {
            const nested = [{ a: { b: 1 } }, { a: { b: 2 } }];
            const pairs = [
                [1, 9],
                [2, 8],
            ];

            expect(_intersectionBy(nested, [{ a: { b: 2 } }], "a.b")).toEqual([{ a: { b: 2 } }]);
            expect(_intersectionBy([{ a: 1, b: 2 }, { a: 2 }], [{ a: 1 }], { a: 1 })).toEqual([
                { a: 1, b: 2 },
            ]);
            expect(_intersectionBy(pairs, [[3, 9]], 1)).toEqual([[1, 9]]);
            // as in lodash, an array last argument is always a list to intersect, not a matches-property pair
            expect(_intersectionBy([{ a: { b: 1 } }], [{ a: { b: 1 } }], ["a", "b"])).toEqual([]);
            expect(_intersectionBy([{ a: 1 }, { a: 2 }], [{ a: 1 }], ["a", 1])).toEqual([]);
        });

        it("uses the identity when the last argument is an array-like object, undefined or null", () => {
            expect(_intersectionBy([2, 1, 2], [2, 3])).toEqual([2]);
            const missing = undefined as unknown as (value: number) => number;
            const nothing = null as unknown as (value: number) => number;

            expect(_intersectionBy([1, 2], [2], missing)).toEqual([2]);
            expect(_intersectionBy([1, 2], [2], nothing)).toEqual([2]);
            expect(_intersectionBy([1, 2, 2])).toEqual([1, 2]);
            expect(_intersectionBy([1.1, 1.9, 2.1], Math.floor)).toEqual([1.1, 2.1]);
        });

        it("invokes the iteratee with the value only and an undefined this, other arrays first", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];

            _intersectionBy(["a", "b"], ["c", "d"], ["e"], function (this: unknown, ...args: unknown[]) {
                calls.push(args);
                bindings.push(this);

                return args[0];
            });

            // the other arrays are mapped from the last to the first, then the first array is walked
            expect(calls).toEqual([["e"], ["c"], ["d"], ["a"], ["b"]]);
            expect(bindings).toEqual([undefined, undefined, undefined, undefined, undefined]);
        });

        it("compares criteria with SameValueZero and keeps result references from the first array", () => {
            const point = { x: 1 };

            expect(_intersectionBy([NaN, 1], [NaN], (value) => value)).toEqual([NaN]);
            expect(_intersectionBy([1, "1"], ["1"], (value) => value)).toEqual(["1"]);
            expect(_intersectionBy([1, "1"], ["1"], String)).toEqual([1]);

            const nullish = [undefined, null];

            expect(_intersectionBy(nullish, [null, undefined], (value) => value)).toEqual([undefined, null]);
            expect(_intersectionBy([point], [{ x: 1 }], "x")[0]).toBe(point);
        });

        it("stops walking the first array once the result is as long as the shortest array", () => {
            const seen: unknown[] = [];

            expect(_intersectionBy([1, 1, 2, 3], [1], (value) => (seen.push(value), value))).toEqual([1]);
            expect(seen).toEqual([1, 1]);

            seen.length = 0;
            _intersectionBy([1, 2], null as unknown as number[], (value) => (seen.push(value), value));
            expect(seen).toEqual([]);
        });

        it("propagates errors thrown by the iteratee", () => {
            expect(() =>
                _intersectionBy([1], [2], () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("arrays", () => {
        it("normalises -0 to 0 in the result", () => {
            const isPositiveZero = (value: number) => Object.is(value, 0);

            expect(_intersectionBy([-0, 1], [0], (value) => value).map(isPositiveZero)).toEqual([true]);
            expect(_intersectionBy([-0, 1], [-0]).map(isPositiveZero)).toEqual([true]);
        });

        it("returns an empty array when the first argument is not an array-like object", () => {
            expect(_intersectionBy(null, [1])).toEqual([]);
            expect(_intersectionBy(undefined, [1])).toEqual([]);
            expect(_intersectionBy(1 as unknown as number[], [1])).toEqual([]);
            expect(_intersectionBy("ab" as unknown as string[], ["a"])).toEqual([]);
            expect(_intersectionBy({ a: 1 } as unknown as number[], [1])).toEqual([]);
            expect(_intersectionBy()).toEqual([]);
            expect(_intersectionBy(Math.floor)).toEqual([]);
        });

        it("takes a string last argument as the iteratee and other non-array-likes as empty", () => {
            expect(_intersectionBy([1, 2], null as unknown as number[], (value) => value)).toEqual([]);
            expect(_intersectionBy([1, 2], null as unknown as number[], [2])).toEqual([]);
            // a string is the property iteratee here, so only the first array is intersected with itself
            expect(_intersectionBy([1, 2], "12" as unknown as number[])).toEqual([1]);
            expect(_intersectionBy(["a"], "a" as unknown as string[])).toEqual(["a"]);
            expect(_intersectionBy([1], [], (value) => value)).toEqual([]);
            expect(_intersectionBy([], [1], (value) => value)).toEqual([]);
        });

        it("accepts array-like objects, arguments objects and typed arrays", () => {
            const args = getArguments(1, 2) as unknown as number[];

            const arrayLike = { length: 2, 0: 1, 1: 2 };

            expect(_intersectionBy(arrayLike, { length: 1, 0: 2 }, (value) => value)).toEqual([2]);
            expect(_intersectionBy(args, [2])).toEqual([2]);
            expect(_intersectionBy(new Uint8Array([1, 2]), new Uint8Array([2]), Number)).toEqual([2]);
        });

        it("visits holes as undefined and leaves the inputs untouched", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_intersectionBy([1, , 3], [undefined, 3], (value) => value)).toEqual([undefined, 3]);

            const first = [1, 2];
            const second = [2];

            _intersectionBy(first, second, Math.floor);

            expect(first).toEqual([1, 2]);
            expect(second).toEqual([2]);
        });

        it("handles large inputs", () => {
            const big = Array.from({ length: 300 }, (_, index) => ({ x: index % 150 }));
            const numbers = Array.from({ length: 300 }, (_, index) => index);

            expect(_intersectionBy(big, [{ x: 5 }], "x")).toEqual([{ x: 5 }]);
            expect(_intersectionBy(big, big.slice(0, 200), "x")).toHaveLength(150);
            expect(
                _intersectionBy(
                    numbers,
                    numbers.map((value) => value + 150),
                ),
            ).toHaveLength(150);
            expect(_intersectionBy(numbers, [5, 5, 7])).toEqual([5, 7]);
        });
    });

    describe("typing", () => {
        it("returns the element type of the first array", () => {
            const points: IPoint[] = _intersectionBy([{ x: 1, y: 2 }], [{ x: 1 }], "x");
            const numbers: number[] = _intersectionBy([1.1], [1.9], Math.floor);
            const plain: string[] = _intersectionBy(["a"], ["a"]);

            expect(points).toEqual([{ x: 1, y: 2 }]);
            expect(numbers).toEqual([1.1]);
            expect(plain).toEqual(["a"]);
        });
    });
});
