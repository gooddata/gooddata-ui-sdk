// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isValidNumberParameterValue } from "../index.js";

describe("isValidNumberParameterValue", () => {
    it("returns true for a value within min/max bounds", () => {
        expect(isValidNumberParameterValue(5, { min: 0, max: 10 })).toBe(true);
    });

    it("returns false for a value below min", () => {
        expect(isValidNumberParameterValue(-1, { min: 0, max: 10 })).toBe(false);
    });

    it("returns false for a value above max", () => {
        expect(isValidNumberParameterValue(11, { min: 0, max: 10 })).toBe(false);
    });

    it("treats bounds as inclusive (== min and == max are valid)", () => {
        expect(isValidNumberParameterValue(0, { min: 0, max: 10 })).toBe(true);
        expect(isValidNumberParameterValue(10, { min: 0, max: 10 })).toBe(true);
    });

    it("treats a missing bound as unbounded on that side", () => {
        expect(isValidNumberParameterValue(1000, { min: 0 })).toBe(true);
        expect(isValidNumberParameterValue(-1, { min: 0 })).toBe(false);
        expect(isValidNumberParameterValue(-1000, { max: 10 })).toBe(true);
        expect(isValidNumberParameterValue(11, { max: 10 })).toBe(false);
    });

    it("returns true for any finite value when there are no constraints", () => {
        expect(isValidNumberParameterValue(42)).toBe(true);
        expect(isValidNumberParameterValue(-42, {})).toBe(true);
    });

    it("returns false for non-finite values regardless of constraints", () => {
        expect(isValidNumberParameterValue(NaN)).toBe(false);
        expect(isValidNumberParameterValue(Infinity)).toBe(false);
        expect(isValidNumberParameterValue(-Infinity)).toBe(false);
        expect(isValidNumberParameterValue(Infinity, { min: 0 })).toBe(false);
    });
});
