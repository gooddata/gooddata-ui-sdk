// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _inRange } from "./inRange.js";

// Expected values match lodash-es@4.18.1 `inRange`.
describe("inRange", () => {
    describe("ranges", () => {
        it("checks start inclusive and end exclusive", () => {
            expect(_inRange(3, 2, 4)).toBe(true);
            expect(_inRange(2, 2, 4)).toBe(true);
            expect(_inRange(4, 2, 4)).toBe(false);
            expect(_inRange(1, 2, 4)).toBe(false);
            expect(_inRange(5, 2, 4)).toBe(false);
            expect(_inRange(1.2, 2)).toBe(true);
            expect(_inRange(5.2, 4)).toBe(false);
        });

        it("uses 0 as the start when only an end is given", () => {
            expect(_inRange(4, 8)).toBe(true);
            expect(_inRange(0, 8)).toBe(true);
            expect(_inRange(8, 8)).toBe(false);
            expect(_inRange(-1, 8)).toBe(false);
            expect(_inRange(-1, -2)).toBe(true);
            expect(_inRange(-2, -2)).toBe(true);
            expect(_inRange(0, -2)).toBe(false);
        });

        it("swaps start and end when start is larger", () => {
            expect(_inRange(3, 4, 2)).toBe(true);
            expect(_inRange(2, 4, 2)).toBe(true);
            expect(_inRange(4, 4, 2)).toBe(false);
            expect(_inRange(-3, -2, -5)).toBe(true);
            expect(_inRange(-5, -2, -5)).toBe(true);
            expect(_inRange(-2, -2, -5)).toBe(false);
        });

        it("is always false for an empty range", () => {
            expect(_inRange(0, 0)).toBe(false);
            expect(_inRange(2, 2, 2)).toBe(false);
            expect(_inRange(0, 0, 0)).toBe(false);
        });

        it("handles fractions, signed zero and infinities", () => {
            expect(_inRange(0.2, 0.1, 0.3)).toBe(true);
            expect(_inRange(0.3, 0.1, 0.3)).toBe(false);
            expect(_inRange(2, 1.5, 3.5)).toBe(true);
            expect(_inRange(-0, 1)).toBe(true);
            expect(_inRange(0, -1, 0)).toBe(false);
            expect(_inRange(-0, -0)).toBe(false);
            expect(_inRange(1e21, 0, Infinity)).toBe(true);
            expect(_inRange(Infinity, 0, Infinity)).toBe(false);
            // an infinite bound becomes the largest finite number of its sign, so infinity is never in range
            expect(_inRange(-Infinity, -Infinity, 0)).toBe(false);
            expect(_inRange(-1e308, -Infinity, 0)).toBe(true);
            expect(_inRange(1e308, Number.MAX_VALUE)).toBe(true);
        });

        it("is false when the number is NaN", () => {
            expect(_inRange(NaN, 0, 5)).toBe(false);
            expect(_inRange(NaN, 5)).toBe(false);
        });
    });

    describe("coercion", () => {
        it("coerces the number the way lodash does", () => {
            expect(_inRange("3" as unknown as number, 5)).toBe(true);
            expect(_inRange(" 3 " as unknown as number, 5)).toBe(true);
            expect(_inRange("0x3" as unknown as number, 5)).toBe(true);
            expect(_inRange("1e1" as unknown as number, 5)).toBe(false);
            expect(_inRange("x" as unknown as number, 5)).toBe(false);
            expect(_inRange("" as unknown as number, 5)).toBe(true);
            expect(_inRange(null as unknown as number, 5)).toBe(true);
            expect(_inRange(undefined as unknown as number, 5)).toBe(false);
            expect(_inRange(true as unknown as number, 5)).toBe(true);
            expect(_inRange(false as unknown as number, 5)).toBe(true);
            expect(_inRange([3] as unknown as number, 5)).toBe(true);
            expect(_inRange([1, 2] as unknown as number, 5)).toBe(false);
            expect(_inRange({} as unknown as number, 5)).toBe(false);
            expect(_inRange({ valueOf: () => 3 } as unknown as number, 5)).toBe(true);
            expect(_inRange(Symbol("3") as unknown as number, 5)).toBe(false);
        });

        it("coerces start and end to finite numbers, so NaN bounds become 0", () => {
            expect(_inRange(3, "2" as unknown as number, "5" as unknown as number)).toBe(true);
            expect(_inRange(3, NaN, 5)).toBe(true);
            expect(_inRange(-1, NaN, 5)).toBe(false);
            expect(_inRange(3, 2, NaN)).toBe(false);
            expect(_inRange(1, 2, NaN)).toBe(true);
            expect(_inRange(3, null as unknown as number, 5)).toBe(true);
            expect(_inRange(3, undefined as unknown as number, 5)).toBe(true);
            expect(_inRange(3, "x" as unknown as number, 5)).toBe(true);
            expect(_inRange(3, 2, "x" as unknown as number)).toBe(false);
            expect(_inRange(3, true as unknown as number, 5)).toBe(true);
            expect(_inRange(3, [2] as unknown as number, [5] as unknown as number)).toBe(true);
            expect(_inRange(3, { valueOf: () => 2 } as unknown as number, 5)).toBe(true);
            expect(_inRange(3, Infinity)).toBe(true);
            expect(_inRange(3, -Infinity)).toBe(false);
        });

        it("treats an explicit undefined end as not given", () => {
            expect(_inRange(1, 2, undefined)).toBe(true);
            expect(_inRange(3, 2, undefined)).toBe(false);
        });

        it("throws a TypeError for bigint arguments", () => {
            expect(() => _inRange(3n as unknown as number, 5)).toThrow(TypeError);
            expect(() => _inRange(3, 5n as unknown as number)).toThrow(TypeError);
            expect(() => _inRange(3, 1, 5n as unknown as number)).toThrow(TypeError);
        });

        it("ignores extra arguments and treats missing arguments as undefined", () => {
            const withExtra = _inRange as unknown as (a: number, b: number, c: number, d: number) => boolean;

            expect(withExtra(3, 1, 5, 9)).toBe(true);
            expect((_inRange as unknown as () => boolean)()).toBe(false);
            expect((_inRange as unknown as (a: number) => boolean)(1)).toBe(false);
            expect(_inRange.length).toBe(3);
        });
    });
});
