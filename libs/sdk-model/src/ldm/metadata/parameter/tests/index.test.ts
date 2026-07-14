// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IParameterDefinition,
    isStringParameterDefinition,
    isValidNumberParameterValue,
    isValidParameterValue,
} from "../index.js";

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

describe("isValidParameterValue", () => {
    it("validates a NUMBER value against the definition's min/max", () => {
        const definition: IParameterDefinition = {
            type: "NUMBER",
            defaultValue: 5,
            constraints: { min: 0, max: 10 },
        };
        expect(isValidParameterValue(definition, 5)).toBe(true);
        expect(isValidParameterValue(definition, 11)).toBe(false);
    });

    it("accepts any string for a STRING definition without constraints", () => {
        const definition: IParameterDefinition = { type: "STRING", defaultValue: "Actual" };
        expect(isValidParameterValue(definition, "Plan")).toBe(true);
        expect(isValidParameterValue(definition, "")).toBe(true);
    });

    it("honors minLength/maxLength for a STRING definition", () => {
        const definition: IParameterDefinition = {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { minLength: 1, maxLength: 5 },
        };
        expect(isValidParameterValue(definition, "Plan")).toBe(true);
        expect(isValidParameterValue(definition, "")).toBe(false);
        expect(isValidParameterValue(definition, "TooLong")).toBe(false);
    });

    it("rejects a value whose type does not match the definition", () => {
        const numberDefinition: IParameterDefinition = { type: "NUMBER", defaultValue: 5 };
        const stringDefinition: IParameterDefinition = { type: "STRING", defaultValue: "Actual" };
        expect(isValidParameterValue(numberDefinition, "Plan")).toBe(false);
        expect(isValidParameterValue(stringDefinition, 5)).toBe(false);
    });
});

describe("isStringParameterDefinition", () => {
    it("is true for a STRING definition and false for a NUMBER definition", () => {
        expect(isStringParameterDefinition({ type: "STRING", defaultValue: "Actual" })).toBe(true);
        expect(isStringParameterDefinition({ type: "NUMBER", defaultValue: 5 })).toBe(false);
    });
});
