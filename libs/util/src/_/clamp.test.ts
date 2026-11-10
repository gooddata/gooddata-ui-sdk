// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _clamp } from "./clamp.js";

// Expected values match lodash-es@4.18.1 `clamp`.
describe("clamp", () => {
    describe("bounds", () => {
        it("clamps within the inclusive lower and upper bounds", () => {
            expect(_clamp(-10, -5, 5)).toBe(-5);
            expect(_clamp(10, -5, 5)).toBe(5);
            expect(_clamp(0, -5, 5)).toBe(0);
            expect(_clamp(-5, -5, 5)).toBe(-5);
            expect(_clamp(5, -5, 5)).toBe(5);
            expect(_clamp(7, 7, 7)).toBe(7);
        });

        it("treats a single bound as the upper bound", () => {
            expect(_clamp(10, 5)).toBe(5);
            expect(_clamp(-10, 5)).toBe(-10);
            expect(_clamp(3, 5)).toBe(3);
            expect(_clamp(10, 0)).toBe(0);
            expect(_clamp(-3, 0)).toBe(-3);
        });

        it("applies the upper bound first, so a lower bound above the upper one wins", () => {
            expect(_clamp(3, 5, 1)).toBe(5);
            expect(_clamp(5, Infinity, -Infinity)).toBe(Infinity);
        });

        it("accepts infinite bounds and values", () => {
            expect(_clamp(Infinity, 0, 10)).toBe(10);
            expect(_clamp(-Infinity, 0, 10)).toBe(0);
            expect(_clamp(5, -Infinity, Infinity)).toBe(5);
            expect(_clamp(5, 0, Infinity)).toBe(5);
            expect(_clamp(1e308, 0, 1e308)).toBe(1e308);
        });

        it("skips an undefined lower bound but coerces a null one to 0", () => {
            expect(_clamp(5, undefined as unknown as number, 10)).toBe(5);
            expect(_clamp(-5, undefined as unknown as number, 10)).toBe(-5);
            expect(_clamp(5, null as unknown as number, 10)).toBe(5);
            expect(_clamp(-5, null as unknown as number, 10)).toBe(0);
            expect(_clamp(5, 0, null as unknown as number)).toBe(0);
        });
    });

    describe("NaN", () => {
        it("passes a NaN number through untouched", () => {
            expect(_clamp(NaN, 0, 10)).toBeNaN();
            expect(_clamp(NaN as number, 5)).toBeNaN();
            expect(_clamp("abc" as unknown as number, 0, 10)).toBeNaN();
            expect(_clamp(undefined as unknown as number, 5)).toBeNaN();
        });

        it("treats a NaN bound as 0", () => {
            expect(_clamp(5, NaN, 10)).toBe(5);
            expect(_clamp(-5, NaN, 10)).toBe(0);
            expect(_clamp(5, 0, NaN)).toBe(0);
            expect(_clamp(15, 0, NaN)).toBe(0);
            expect(_clamp(-5, NaN)).toBe(-5);
            expect(_clamp(15, NaN)).toBe(0);
            expect(_clamp(5, Symbol("s") as unknown as number, 10)).toBe(5);
        });
    });

    describe("signed zero", () => {
        it("keeps the sign of a zero that is already within bounds", () => {
            expect(Object.is(_clamp(-0, 0, 1), -0)).toBe(true);
            expect(Object.is(_clamp(-0, -1, 0), -0)).toBe(true);
            expect(Object.is(_clamp(0, -1, -0), 0)).toBe(true);
            expect(Object.is(_clamp(0, -0, 0), 0)).toBe(true);
        });
    });

    describe("coercion", () => {
        it("converts numeric strings, including hex, binary and octal, and trims whitespace", () => {
            expect(
                _clamp("10" as unknown as number, "-5" as unknown as number, "5" as unknown as number),
            ).toBe(5);
            expect(_clamp("  3  " as unknown as number, 0, 10)).toBe(3);
            expect(_clamp("0x10" as unknown as number, 0, 100)).toBe(16);
            expect(_clamp("0b11" as unknown as number, 0, 10)).toBe(3);
            expect(_clamp("0o17" as unknown as number, 0, 100)).toBe(15);
            expect(_clamp("1e3" as unknown as number, 0, 10000)).toBe(1000);
            expect(_clamp("Infinity" as unknown as number, 0, 10)).toBe(10);
            expect(_clamp("" as unknown as number, 0, 10)).toBe(0);
            expect(_clamp("-0x10" as unknown as number, 0, 10)).toBeNaN();
            expect(_clamp(5, "3" as unknown as number, "4" as unknown as number)).toBe(4);
        });

        it("converts other primitives and objects the way lodash does", () => {
            expect(_clamp(null as unknown as number, 0, 10)).toBe(0);
            expect(_clamp(true as unknown as number, 0, 10)).toBe(1);
            expect(_clamp(false as unknown as number, 1, 10)).toBe(1);
            expect(_clamp([] as unknown as number, 0, 10)).toBe(0);
            expect(_clamp([5] as unknown as number, 0, 10)).toBe(5);
            expect(_clamp([1, 2] as unknown as number, 0, 10)).toBeNaN();
            expect(_clamp({} as unknown as number, 0, 10)).toBeNaN();
            expect(_clamp({ valueOf: (): number => 7 } as unknown as number, 0, 10)).toBe(7);
            expect(_clamp({ toString: (): string => "8" } as unknown as number, 0, 10)).toBe(8);
            // oxlint-disable-next-line sonarjs/no-primitive-wrappers
            expect(_clamp(new Number(5) as unknown as number, 0, 10)).toBe(5);
            expect(_clamp(new Date(5) as unknown as number, 0, 10)).toBe(5);
            expect(_clamp(Symbol("s") as unknown as number, 0, 10)).toBeNaN();
            expect(_clamp(5, true as unknown as number, 10)).toBe(5);
        });

        it("throws for a bigint, as the numeric coercion does", () => {
            expect(() => _clamp(1n as unknown as number, 0, 10)).toThrow(TypeError);
            expect(() => _clamp(5, 0, 1n as unknown as number)).toThrow(TypeError);
        });
    });

    describe("typing", () => {
        it("accepts two or three numbers and returns a number", () => {
            const three: number = _clamp(3, 1, 2);
            const two: number = _clamp(3, 2);

            expect(three).toBe(2);
            expect(two).toBe(2);
        });
    });
});
