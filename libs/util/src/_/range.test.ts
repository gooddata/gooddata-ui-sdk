// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _range } from "./range.js";

// Expected values match lodash-es@4.18.1 `range`.
describe("range", () => {
    describe("one argument", () => {
        it("counts from zero up to, but not including, end", () => {
            expect(_range(4)).toEqual([0, 1, 2, 3]);
            expect(_range(1)).toEqual([0]);
        });

        it("counts down with a step of -1 for a negative end", () => {
            expect(_range(-4)).toEqual([0, -1, -2, -3]);
        });

        it("returns an empty array for zero, NaN and nullish", () => {
            expect(_range(0)).toEqual([]);
            expect(_range(-0)).toEqual([]);
            expect(_range(NaN)).toEqual([]);
            expect(_range(null as unknown as number)).toEqual([]);
            expect(_range(undefined as unknown as number)).toEqual([]);
        });
    });

    describe("start and end", () => {
        it("counts up from start to end", () => {
            expect(_range(1, 5)).toEqual([1, 2, 3, 4]);
            expect(_range(-3, -1)).toEqual([-3, -2]);
        });

        it("counts down when end is below start", () => {
            expect(_range(5, 1)).toEqual([5, 4, 3, 2]);
            expect(_range(-1, -3)).toEqual([-1, -2]);
        });

        it("returns an empty array when start equals end", () => {
            expect(_range(3, 3)).toEqual([]);
            expect(_range(0, -0)).toEqual([]);
        });

        it("keeps the sign of a negative zero start", () => {
            const [first] = _range(-0, 3);

            expect(Object.is(first, -0)).toBe(true);
        });
    });

    describe("step", () => {
        it("increments or decrements by step", () => {
            expect(_range(0, 20, 5)).toEqual([0, 5, 10, 15]);
            expect(_range(0, -4, -1)).toEqual([0, -1, -2, -3]);
            expect(_range(5, 1, -2)).toEqual([5, 3]);
        });

        it("supports fractional steps", () => {
            expect(_range(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75]);
            expect(_range(0.5, 3)).toEqual([0.5, 1.5, 2.5]);
        });

        it("repeats start when step is zero, as many times as the distance", () => {
            expect(_range(1, 4, 0)).toEqual([1, 1, 1]);
        });

        it("returns an empty array when step points away from end", () => {
            expect(_range(1, 5, -1)).toEqual([]);
            expect(_range(5, 1, 1)).toEqual([]);
        });

        it("treats a NaN step as zero", () => {
            expect(_range(1, 4, NaN)).toEqual([1, 1, 1]);
        });
    });

    describe("coercion", () => {
        it("coerces numeric strings and booleans", () => {
            expect(_range("3" as unknown as number)).toEqual([0, 1, 2]);
            expect(_range("1" as unknown as number, "4" as unknown as number)).toEqual([1, 2, 3]);
            expect(
                _range("1" as unknown as number, "4" as unknown as number, "2" as unknown as number),
            ).toEqual([1, 3]);
            expect(_range(" 5 " as unknown as number)).toEqual([0, 1, 2, 3, 4]);
            expect(_range("0b11" as unknown as number)).toEqual([0, 1, 2]);
            expect(_range(true as unknown as number, 3)).toEqual([1, 2]);
        });

        it("treats values that do not convert to a number as zero", () => {
            expect(_range("abc" as unknown as number)).toEqual([]);
            expect(_range({} as unknown as number)).toEqual([]);
            expect(_range(NaN, 3)).toEqual([0, 1, 2]);
            expect(_range(1, NaN)).toEqual([1]);
        });

        it("accepts a single-element array as its number", () => {
            expect(_range([2] as unknown as number)).toEqual([0, 1]);
        });
    });

    describe("iteratee-call guard", () => {
        it("ignores the index and guard arguments when called as an iteratee over a collection", () => {
            // this is what makes `[3, 4].map(range)` and `mapValues({ a: 3 }, range)` behave
            expect(_range(3, 0, [3, 9])).toEqual([0, 1, 2]);
            expect(_range(3, "1", { 1: 3 })).toEqual([0, 1, 2]);
            expect([2, 3].map((end, index, array) => _range(end, index, array))).toEqual([
                [0, 1],
                [0, 1, 2],
            ]);
        });

        it("otherwise coerces the third argument as the step, which an array or object turns into zero", () => {
            // step 0 with end below start gives a negative distance, hence no elements
            expect(_range(3, 0, [4, 9])).toEqual([]);
            expect(_range(3, "1", { 1: 4 })).toEqual([]);
            expect(_range(0, 3, [4, 9])).toEqual([0, 0, 0]);
        });
    });

    describe("size", () => {
        it("builds long ranges", () => {
            const result = _range(0, 10000);

            expect(result).toHaveLength(10000);
            expect(result[9999]).toBe(9999);
        });

        it("returns a fresh array each time", () => {
            expect(_range(2)).not.toBe(_range(2));
        });
    });
});
