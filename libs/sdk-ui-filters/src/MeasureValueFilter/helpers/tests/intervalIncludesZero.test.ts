// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { intervalIncludesZero } from "../intervalIncludesZero.js";

describe("intervalIncludesZero", () => {
    describe("ALL operator", () => {
        it("should return true for ALL operator", () => {
            expect(intervalIncludesZero("ALL")).toBe(true);
            expect(intervalIncludesZero("ALL", 100)).toBe(true);
            expect(intervalIncludesZero("ALL", -100)).toBe(true);
        });
    });

    describe("GREATER_THAN operator", () => {
        it("should return false when value is positive (interval does not include zero)", () => {
            expect(intervalIncludesZero("GREATER_THAN", 2000)).toBe(false);
            expect(intervalIncludesZero("GREATER_THAN", 1)).toBe(false);
            expect(intervalIncludesZero("GREATER_THAN", 0.1)).toBe(false);
        });

        it("should return false when value is zero (interval does not include zero)", () => {
            expect(intervalIncludesZero("GREATER_THAN", 0)).toBe(false);
        });

        it("should return true when value is negative (interval includes zero)", () => {
            expect(intervalIncludesZero("GREATER_THAN", -1)).toBe(true);
            expect(intervalIncludesZero("GREATER_THAN", -100)).toBe(true);
        });
    });

    describe("GREATER_THAN_OR_EQUAL_TO operator", () => {
        it("should return false when value is positive (interval does not include zero)", () => {
            expect(intervalIncludesZero("GREATER_THAN_OR_EQUAL_TO", 2000)).toBe(false);
            expect(intervalIncludesZero("GREATER_THAN_OR_EQUAL_TO", 1)).toBe(false);
        });

        it("should return true when value is zero (interval includes zero)", () => {
            expect(intervalIncludesZero("GREATER_THAN_OR_EQUAL_TO", 0)).toBe(true);
        });

        it("should return true when value is negative (interval includes zero)", () => {
            expect(intervalIncludesZero("GREATER_THAN_OR_EQUAL_TO", -1)).toBe(true);
            expect(intervalIncludesZero("GREATER_THAN_OR_EQUAL_TO", -100)).toBe(true);
        });
    });

    describe("LESS_THAN operator", () => {
        it("should return true when value is positive (interval includes zero)", () => {
            expect(intervalIncludesZero("LESS_THAN", 10)).toBe(true);
            expect(intervalIncludesZero("LESS_THAN", 1)).toBe(true);
            expect(intervalIncludesZero("LESS_THAN", 0.1)).toBe(true);
        });

        it("should return false when value is zero (interval does not include zero)", () => {
            expect(intervalIncludesZero("LESS_THAN", 0)).toBe(false);
        });

        it("should return false when value is negative (interval does not include zero)", () => {
            expect(intervalIncludesZero("LESS_THAN", -1)).toBe(false);
            expect(intervalIncludesZero("LESS_THAN", -100)).toBe(false);
        });
    });

    describe("LESS_THAN_OR_EQUAL_TO operator", () => {
        it("should return true when value is positive (interval includes zero)", () => {
            expect(intervalIncludesZero("LESS_THAN_OR_EQUAL_TO", 10)).toBe(true);
            expect(intervalIncludesZero("LESS_THAN_OR_EQUAL_TO", 1)).toBe(true);
        });

        it("should return true when value is zero (interval includes zero)", () => {
            expect(intervalIncludesZero("LESS_THAN_OR_EQUAL_TO", 0)).toBe(true);
        });

        it("should return false when value is negative (interval does not include zero)", () => {
            expect(intervalIncludesZero("LESS_THAN_OR_EQUAL_TO", -1)).toBe(false);
            expect(intervalIncludesZero("LESS_THAN_OR_EQUAL_TO", -100)).toBe(false);
        });
    });

    describe("EQUAL_TO operator", () => {
        it("should return true when value is zero", () => {
            expect(intervalIncludesZero("EQUAL_TO", 0)).toBe(true);
        });

        it("should return false when value is not zero", () => {
            expect(intervalIncludesZero("EQUAL_TO", 10)).toBe(false);
            expect(intervalIncludesZero("EQUAL_TO", -10)).toBe(false);
            expect(intervalIncludesZero("EQUAL_TO", 0.1)).toBe(false);
        });
    });

    describe("NOT_EQUAL_TO operator", () => {
        it("should return false when value is zero", () => {
            expect(intervalIncludesZero("NOT_EQUAL_TO", 0)).toBe(false);
        });

        it("should return true when value is not zero", () => {
            expect(intervalIncludesZero("NOT_EQUAL_TO", 10)).toBe(true);
            expect(intervalIncludesZero("NOT_EQUAL_TO", -10)).toBe(true);
            expect(intervalIncludesZero("NOT_EQUAL_TO", 0.1)).toBe(true);
        });
    });

    describe("BETWEEN operator", () => {
        it("should return true when interval includes zero", () => {
            expect(intervalIncludesZero("BETWEEN", -5, 5)).toBe(true);
            expect(intervalIncludesZero("BETWEEN", -100, 100)).toBe(true);
            expect(intervalIncludesZero("BETWEEN", -10, 0)).toBe(true);
            expect(intervalIncludesZero("BETWEEN", 0, 10)).toBe(true);
            expect(intervalIncludesZero("BETWEEN", 0, 0)).toBe(true);
        });

        it("should return false when interval does not include zero", () => {
            expect(intervalIncludesZero("BETWEEN", 10, 20)).toBe(false);
            expect(intervalIncludesZero("BETWEEN", 1, 100)).toBe(false);
            expect(intervalIncludesZero("BETWEEN", -20, -10)).toBe(false);
            expect(intervalIncludesZero("BETWEEN", -100, -1)).toBe(false);
        });

        it("should return true when 'to' parameter is undefined (incomplete range)", () => {
            expect(intervalIncludesZero("BETWEEN", -5)).toBe(true);
            expect(intervalIncludesZero("BETWEEN", 5)).toBe(true);
            expect(intervalIncludesZero("BETWEEN", 0)).toBe(true);
        });
    });

    describe("NOT_BETWEEN operator", () => {
        it("should return false when zero is within the excluded interval", () => {
            expect(intervalIncludesZero("NOT_BETWEEN", -5, 5)).toBe(false);
            expect(intervalIncludesZero("NOT_BETWEEN", -100, 100)).toBe(false);
            expect(intervalIncludesZero("NOT_BETWEEN", -10, 0)).toBe(false);
            expect(intervalIncludesZero("NOT_BETWEEN", 0, 10)).toBe(false);
            expect(intervalIncludesZero("NOT_BETWEEN", 0, 0)).toBe(false);
        });

        it("should return true when zero is outside the excluded interval", () => {
            expect(intervalIncludesZero("NOT_BETWEEN", 10, 20)).toBe(true);
            expect(intervalIncludesZero("NOT_BETWEEN", 1, 100)).toBe(true);
            expect(intervalIncludesZero("NOT_BETWEEN", -20, -10)).toBe(true);
            expect(intervalIncludesZero("NOT_BETWEEN", -100, -1)).toBe(true);
        });

        it("should return true when 'to' parameter is undefined (incomplete range)", () => {
            expect(intervalIncludesZero("NOT_BETWEEN", -5)).toBe(true);
            expect(intervalIncludesZero("NOT_BETWEEN", 5)).toBe(true);
            expect(intervalIncludesZero("NOT_BETWEEN", 0)).toBe(true);
        });
    });

    describe("edge cases", () => {
        it("should return true when value is undefined (show checkbox by default)", () => {
            expect(intervalIncludesZero("GREATER_THAN", undefined)).toBe(true);
            expect(intervalIncludesZero("GREATER_THAN_OR_EQUAL_TO", undefined)).toBe(true);
            expect(intervalIncludesZero("LESS_THAN", undefined)).toBe(true);
            expect(intervalIncludesZero("LESS_THAN_OR_EQUAL_TO", undefined)).toBe(true);
            expect(intervalIncludesZero("EQUAL_TO", undefined)).toBe(true);
            expect(intervalIncludesZero("NOT_EQUAL_TO", undefined)).toBe(true);
        });

        it("should return true when value is undefined for range operators", () => {
            expect(intervalIncludesZero("BETWEEN", undefined)).toBe(true);
            expect(intervalIncludesZero("BETWEEN", undefined, undefined)).toBe(true);
            expect(intervalIncludesZero("NOT_BETWEEN", undefined)).toBe(true);
            expect(intervalIncludesZero("NOT_BETWEEN", undefined, undefined)).toBe(true);
        });
    });
});
