// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getDraftValidationError } from "../ParameterControlDropdown.js";

describe("getDraftValidationError", () => {
    it("flags an empty draft as not-a-number", () => {
        expect(getDraftValidationError("", { min: 0, max: 100 })?.id).toBe(
            "parameter_filter.dropdown.error.notANumber",
        );
    });

    it("flags a below-min value as out of range (both bounds)", () => {
        expect(getDraftValidationError("-1", { min: 0, max: 100 })?.id).toBe(
            "parameter_filter.dropdown.error.outOfRange",
        );
    });

    it("uses the min-only variant when only a lower bound is set", () => {
        expect(getDraftValidationError("-1", { min: 0 })?.id).toBe(
            "parameter_filter.dropdown.error.outOfRange.min",
        );
    });

    it("uses the max-only variant when only an upper bound is set", () => {
        expect(getDraftValidationError("101", { max: 100 })?.id).toBe(
            "parameter_filter.dropdown.error.outOfRange.max",
        );
    });

    it("flags a non-numeric draft as not-a-number", () => {
        expect(getDraftValidationError("abc", { min: 0, max: 100 })?.id).toBe(
            "parameter_filter.dropdown.error.notANumber",
        );
    });

    it("flags an above-max value as out of range (both bounds)", () => {
        expect(getDraftValidationError("101", { min: 0, max: 100 })?.id).toBe(
            "parameter_filter.dropdown.error.outOfRange",
        );
    });

    it("accepts an in-range value", () => {
        expect(getDraftValidationError("5", { min: 0, max: 100 })).toBeUndefined();
    });

    it("accepts values on the inclusive boundaries", () => {
        expect(getDraftValidationError("0", { min: 0, max: 100 })).toBeUndefined();
        expect(getDraftValidationError("100", { min: 0, max: 100 })).toBeUndefined();
    });

    it("accepts a value satisfying a single bound", () => {
        expect(getDraftValidationError("9999", { min: 0 })).toBeUndefined();
        expect(getDraftValidationError("-9999", { max: 100 })).toBeUndefined();
    });

    it("accepts any finite value when there are no constraints", () => {
        expect(getDraftValidationError("42")).toBeUndefined();
        expect(getDraftValidationError("-42", {})).toBeUndefined();
    });
});
