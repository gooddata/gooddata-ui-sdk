// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ISeparators } from "@gooddata/number-formatter";

import { DEFAULT_SEPARATORS, formatNumberWithSeparators } from "../numberFormat.js";

describe("formatNumberWithSeparators", () => {
    describe("with default separators", () => {
        it("should format integer with thousand separators", () => {
            expect(formatNumberWithSeparators(1234)).toBe("1,234");
        });

        it("should format large integer with multiple thousand separators", () => {
            expect(formatNumberWithSeparators(1234567890)).toBe("1,234,567,890");
        });

        it("should format number with decimal part", () => {
            expect(formatNumberWithSeparators(1234.56)).toBe("1,234.56");
        });

        it("should format small number without thousand separators", () => {
            expect(formatNumberWithSeparators(123)).toBe("123");
        });

        it("should format negative number with thousand separators", () => {
            expect(formatNumberWithSeparators(-1234.5)).toBe("-1,234.5");
        });

        it("should format zero", () => {
            expect(formatNumberWithSeparators(0)).toBe("0");
        });

        it("should return empty string for null", () => {
            expect(formatNumberWithSeparators(null)).toBe("");
        });

        it("should return empty string for undefined", () => {
            expect(formatNumberWithSeparators(undefined)).toBe("");
        });
    });

    describe("with custom separators", () => {
        const europeanSeparators: ISeparators = {
            thousand: " ",
            decimal: ",",
        };

        it("should format number with space as thousand separator", () => {
            expect(formatNumberWithSeparators(1234567, europeanSeparators)).toBe("1 234 567");
        });

        it("should format number with comma as decimal separator", () => {
            expect(formatNumberWithSeparators(1234.56, europeanSeparators)).toBe("1 234,56");
        });

        it("should format negative number with custom separators", () => {
            expect(formatNumberWithSeparators(-1234.5, europeanSeparators)).toBe("-1 234,5");
        });
    });

    describe("default separators fallback", () => {
        it("should use default separators when none provided", () => {
            expect(formatNumberWithSeparators(1234.56)).toBe("1,234.56");
        });
    });
});

describe("DEFAULT_SEPARATORS", () => {
    it("should have comma as thousand separator", () => {
        expect(DEFAULT_SEPARATORS.thousand).toBe(",");
    });

    it("should have period as decimal separator", () => {
        expect(DEFAULT_SEPARATORS.decimal).toBe(".");
    });
});
